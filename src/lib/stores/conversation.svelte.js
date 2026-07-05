/* Conversation state di atas backend asli (repo `chat`, cmd/http).

   Sumber kebenaran pesan = memori episodik backend:
   GET /sessions/{sid}/messages (thread Zep). Kirim pesan = POST /ava; Ava
   mendelegasikan ke specialist di server, dan SETIAP giliran (delegasi Ava,
   balasan specialist, jawaban akhir) tercatat ke thread yang sama dengan
   `name` pembicara ("human"/"ava"/"zee"/"yori"/"rafal"). Karena POST /ava
   baru selesai setelah seluruh orkestrasi kelar, selama menunggu kita
   POLL thread supaya giliran agent muncul satu-satu seperti group chat.

   Pesan human yang baru dikirim di-render optimistis (status "sending")
   sampai muncul di thread server — id lokalnya diprefiks "local-" dan tidak
   pernah dipersist; id pesan server = UUID Zep. */
import { AGENTS, clockTime, routeAgent } from '../agents.js';
import { api, ApiError, sessionId } from '../api.js';
import { wallet } from './wallet.svelte.js';

/** @typedef {import('../agents.js').Message} Message */

/** Batas riwayat yang diambil sekali muat. */
const HISTORY_LASTN = 200;
/** Jeda antar-poll selama menunggu balasan orkestrasi. */
const POLL_MS = 2200;

/** @type {Message[]} */
let serverMsgs = $state([]);
/** Pesan human optimistis yang belum terlihat di thread server. @type {Message|null} */
let pending = $state(null);
/** @type {{ agent: string } | null} */
let thinking = $state(null);
// true selama satu giliran berjalan (POST /ava masih in-flight) — composer
// mengunci input sampai orkestrasi selesai.
let busy = $state(false);
// riwayat pertama sudah termuat (atau dipastikan kosong) — dipakai menahan
// empty-state supaya tidak berkedip sebelum fetch pertama selesai.
let loaded = $state(false);

/**
 * Pesan thread Zep → pesan UI.
 * - role "system" = pesan internal (mis. wake-up postera untuk Ava) → tidak dirender.
 * - role "user": name "human" (atau tak dikenal) = user; name agent = giliran
 *   delegasi Ava ke specialist (tampil sebagai pesan Ava, mis. "@zee …").
 * - role "assistant": name = agent pengirim.
 * @param {{ content?: string, role?: string, name?: string|null, uuid?: string|null, created_at?: string|null }} m
 * @returns {Message|null}
 */
function toUiMessage(m) {
	if (!m || !m.content || m.role === 'system') return null;
	const name = (m.name || '').toLowerCase();
	const agent = name in AGENTS ? name : null;
	const from = m.role === 'user' ? (agent ?? 'human') : (agent ?? 'ava');
	const at = m.created_at ?? undefined;
	return {
		id: m.uuid || crypto.randomUUID(),
		from,
		type: 'text',
		text: m.content,
		time: clockTime(at),
		at
	};
}

/** @param {unknown} e */
function isNotFound(e) {
	return e instanceof ApiError && e.status === 404;
}

let sendSeq = 0; // id pesan optimistis; tidak dipersist, cukup unik se-sesi tab

// Nomor urut fetch: poll yang masih in-flight tidak boleh menimpa hasil fetch
// yang dimulai belakangan (mis. sinkronisasi final setelah POST /ava) dengan
// snapshot yang lebih lama.
let fetchSeq = 0;

async function fetchThread() {
	const seq = ++fetchSeq;
	const sid = await sessionId();
	try {
		const list = await api(`/sessions/${encodeURIComponent(sid)}/messages?lastn=${HISTORY_LASTN}`);
		if (seq !== fetchSeq) return; // sudah ada fetch yang lebih baru
		/** @type {Message[]} */
		const mapped = [];
		for (const m of list?.messages ?? []) {
			const ui = toUiMessage(m);
			if (ui) mapped.push(ui);
		}
		serverMsgs = mapped;
		// pesan optimistis sudah sampai di thread server → lepas duplikatnya
		if (pending && mapped.some((m) => m.from === 'human' && m.text === pending?.text)) {
			pending = null;
		}
	} catch (e) {
		if (isNotFound(e)) {
			// thread belum pernah dibuat (belum ada run pertama) — memang kosong
			if (seq === fetchSeq) serverMsgs = [];
			return;
		}
		throw e;
	}
}

/**
 * @param {string} text
 * @param {Message} msg pesan optimistis yang dipakai giliran ini
 * @param {import('../agents.js').Agent} agent agent tujuan (Ava atau specialist yang di-@mention)
 */
async function runTurn(text, msg, agent) {
	busy = true;
	thinking = { agent: agent.id };
	// poll thread selama orkestrasi supaya giliran delegasi/specialist muncul live
	const poller = setInterval(() => {
		fetchThread().catch(() => {
			/* poll gagal boleh diam — fetch final setelah POST yang menentukan */
		});
	}, POLL_MS);
	try {
		// routeAgent selalu mengembalikan agent roster (punya endpoint); '/ava'
		// hanya fallback tipe untuk teaser tanpa endpoint.
		await api(agent.endpoint ?? '/ava', { method: 'POST', body: { message: text } });
		msg.status = undefined;
		await fetchThread().catch(() => {
			/* balasan sudah diterima; kegagalan sinkronisasi akhir jangan menandai error */
		});
	} catch (e) {
		msg.status = 'error';
		if (e instanceof ApiError && e.status === 402) {
			msg.errorNote = 'saldo';
		}
	} finally {
		clearInterval(poller);
		thinking = null;
		busy = false;
		// giliran barusan menambah biaya — segarkan saldo & pemakaian di latar
		wallet.refresh().catch(() => {});
	}
}

export const conversation = {
	get messages() {
		return pending ? [...serverMsgs, pending] : serverMsgs;
	},
	get thinking() {
		return thinking;
	},
	get busy() {
		return busy;
	},
	get loaded() {
		return loaded;
	},
	get empty() {
		return loaded && serverMsgs.length === 0 && !pending && !thinking;
	},

	/** Muat riwayat dari backend. Dipanggil sekali setelah login. */
	async load() {
		try {
			await fetchThread();
		} catch {
			// biarkan loaded tetap terset — kanvas kosong lebih baik daripada
			// spinner selamanya; kirim pesan berikutnya akan sinkron ulang.
		} finally {
			loaded = true;
		}
	},

	/** @param {string} text */
	async sendText(text) {
		if (busy || !text.trim()) return;
		const trimmed = text.trim();
		/** @type {Message} */
		const msg = $state({
			id: `local-${++sendSeq}`,
			from: 'human',
			type: 'text',
			text: trimmed,
			time: clockTime(undefined),
			status: 'sending'
		});
		pending = msg;
		// @mention specialist → langsung ke endpoint-nya; selain itu ke Ava.
		await runTurn(trimmed, msg, routeAgent(trimmed));
	},

	/** Kirim ulang pesan optimistis yang gagal. @param {string} id */
	async retry(id) {
		const msg = pending;
		if (busy || !msg || msg.id !== id || !msg.text) return;
		msg.status = 'sending';
		msg.errorNote = undefined;
		await runTurn(msg.text, msg, routeAgent(msg.text));
	},

	/** Reset percakapan: hapus riwayat chat DAN knowledge sekaligus. Di Zep
	    keduanya terikat (memori episodik & semantik lahir dari thread yang sama),
	    jadi reset yang benar = satu operasi `User.Delete` — DELETE /knowledge
	    menghapus user beserta seluruh thread-nya. Thread kosong dibuat ulang oleh
	    backend saat pesan berikutnya. 404 = user/graph belum ada = memang bersih. */
	async clear() {
		try {
			await api('/knowledge', { method: 'DELETE' });
		} catch (e) {
			if (!isNotFound(e)) throw e; // belum ada data = memang sudah kosong
		}
		serverMsgs = [];
		pending = null;
		thinking = null;
		busy = false;
	},

	/** Reset state lokal (dipanggil saat logout). */
	reset() {
		serverMsgs = [];
		pending = null;
		thinking = null;
		busy = false;
		loaded = false;
	}
};
