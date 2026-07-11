/* Conversation state di atas backend asli (repo `chat`, cmd/http).

   Sumber kebenaran pesan = memori episodik backend:
   GET /sessions/messages (thread Zep; backend single-session, sesi
   `chat-<uid>` diturunkan server-side dari token). Kirim pesan = POST /ava; Ava
   mendelegasikan ke specialist di server, dan SETIAP giliran (delegasi Ava,
   balasan specialist, jawaban akhir) tercatat ke thread yang sama dengan
   `name` pembicara ("human"/"ava"/"zee"/"yori"/"rafal"). Karena POST /ava
   baru selesai setelah seluruh orkestrasi kelar, selama menunggu kita
   POLL thread supaya giliran agent muncul satu-satu seperti group chat.

   Pesan human yang baru dikirim di-render optimistis (status "sending")
   sampai muncul di thread server — id lokalnya diprefiks "local-" dan tidak
   pernah dipersist; id pesan server = UUID Zep. */
import { AGENTS, clockTime, routeAgent } from '../agents.js';
import { api, ApiError } from '../api.js';
import { wallet } from './wallet.svelte.js';

/** @typedef {import('../agents.js').Message} Message */

/** Batas riwayat yang diambil sekali muat. */
const HISTORY_LASTN = 200;
/** Jeda antar-poll selama menunggu balasan orkestrasi. */
const POLL_MS = 2200;
/** Lama terus memantau thread saat POST putus di sisi kita padahal pesan
    sudah tercatat di server — orkestrasi kemungkinan masih berjalan tanpa
    kita pegang lagi respons HTTP-nya. */
const WATCH_MS = 90_000;

/** @type {Message[]} */
let serverMsgs = $state([]);
/** Pesan human optimistis yang belum terlihat di thread server. @type {Message|null} */
let pending = $state(null);
/** Id pesan server yang SUDAH ada saat pesan optimistis dikirim. Pesan human
    di thread dengan teks sama tapi id di luar himpunan ini = pesan kita yang
    baru mendarat — bukan pesan lama yang kebetulan teksnya identik.
    @type {Set<string>} */
let pendingBaseline = new Set();
// indikator processing umum (satu untuk semua agent — orkestrasi terjadi di
// server, giliran agent sesungguhnya muncul lewat poll thread)
let thinking = $state(false);
// true selama satu giliran berjalan (POST /ava masih in-flight) — composer
// mengunci pengiriman (tombol kirim jadi tombol stop); mengetik tetap bisa.
let busy = $state(false);
// riwayat pertama sudah termuat (atau dipastikan kosong) — dipakai menahan
// empty-state supaya tidak berkedip sebelum fetch pertama selesai.
let loaded = $state(false);
/** Giliran yang ditutup server dengan error SETELAH pesan human tercatat di
    thread (mis. 502 model provider tumbang, 402 saldo habis di tengah run).
    Pesannya sendiri TERKIRIM — salah kalau ditandai "Gagal terkirim" — tapi
    balasan agent tidak akan pernah datang, jadi diam saja menyesatkan.
    Dirender sebagai notice di bawah thread; hangus saat giliran berikut.
    @type {{ note: 'saldo' | 'server' } | null} */
let turnError = $state(null);

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

/** Controller POST agent yang sedang in-flight — dipegang supaya tombol stop
    bisa membatalkan request-nya. @type {AbortController|null} */
let turnController = null;

// Kunci single-flight KHUSUS POST ke endpoint agent (scope per user — klien
// ini selalu satu user): dua run orkestrasi paralel di thread yang sama tidak
// boleh terjadi dari sisi kita. Guard `busy` di jalur normal sudah mencegah,
// tapi jalur yang sempat await sebelum runTurn (mis. retry yang rekonsiliasi
// dulu) bisa lolos guard itu dua kali — kunci ini penegasan terakhirnya.
let agentPostInFlight = false;

/**
 * @param {string} endpoint
 * @param {string} message
 * @param {AbortSignal} signal
 */
async function postAgentTurn(endpoint, message, signal) {
	if (agentPostInFlight) throw new Error('agent turn already in flight');
	agentPostInFlight = true;
	try {
		return await api(endpoint, { method: 'POST', body: { message }, signal });
	} finally {
		agentPostInFlight = false;
	}
}

// Nomor urut fetch: poll yang masih in-flight tidak boleh menimpa hasil fetch
// yang dimulai belakangan (mis. sinkronisasi final setelah POST /ava) dengan
// snapshot yang lebih lama.
let fetchSeq = 0;

async function fetchThread() {
	const seq = ++fetchSeq;
	try {
		const list = await api(`/sessions/messages?lastn=${HISTORY_LASTN}`);
		if (seq !== fetchSeq) return; // sudah ada fetch yang lebih baru
		/** @type {Message[]} */
		const mapped = [];
		for (const m of list?.messages ?? []) {
			const ui = toUiMessage(m);
			if (ui) mapped.push(ui);
		}
		serverMsgs = mapped;
		// pesan optimistis sudah sampai di thread server → lepas duplikatnya
		// (hanya cocok dengan pesan BARU — id di luar baseline saat kirim —
		// supaya pesan lama berteks sama tidak salah dianggap "sudah mendarat")
		if (
			pending &&
			mapped.some(
				(m) => m.from === 'human' && m.text === pending?.text && !pendingBaseline.has(m.id)
			)
		) {
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
	thinking = true;
	turnError = null; // giliran baru dimulai — notice giliran lama hangus
	const controller = new AbortController();
	turnController = controller;
	// poll thread selama orkestrasi supaya giliran delegasi/specialist muncul live
	const poller = setInterval(() => {
		fetchThread().catch(() => {
			/* poll gagal boleh diam — fetch final setelah POST yang menentukan */
		});
	}, POLL_MS);
	try {
		// routeAgent selalu mengembalikan agent roster (punya endpoint); '/ava'
		// hanya fallback tipe untuk teaser tanpa endpoint.
		await postAgentTurn(agent.endpoint ?? '/ava', text, controller.signal);
		msg.status = undefined;
		await fetchThread().catch(() => {
			/* balasan sudah diterima; kegagalan sinkronisasi akhir jangan menandai error */
		});
	} catch (e) {
		if (controller.signal.aborted) {
			// User membatalkan (tombol stop) — cukup putuskan request HTTP-nya
			// dan berhenti menunggu. Pesan human sudah dipersist backend di awal
			// run; apa pun yang masih ditulis orkestrasi muncul di fetch berikut.
			await fetchThread().catch(() => {});
			if (pending === msg) msg.status = undefined;
			return;
		}
		// POST yang gagal ≠ pesan gagal terkirim: backend mempersist pesan human
		// ke thread di AWAL run, jadi timeout/koneksi putus/error di tengah
		// orkestrasi terjadi SETELAH pesan tercatat. Cek dulu ke server — kalau
		// pesan sudah mendarat, menandai error (lalu user klik "Coba lagi")
		// justru mengirim perintah yang sama dua kali dan memicu agent dua kali.
		const landed = await fetchThread().then(
			() => pending !== msg,
			() => false // gagal cek = anggap belum terkirim; jalur error biasa
		);
		if (!landed) {
			msg.status = 'error';
			if (e instanceof ApiError && e.status === 402) {
				msg.errorNote = 'saldo';
			}
		} else if (e instanceof ApiError) {
			// Server menutup run dengan error PADAHAL pesan human sudah tercatat:
			// balasan tidak akan datang, dan "Coba lagi" bukan jalan keluar
			// (re-POST = pesan dobel). Kabari lewat notice giliran, bukan
			// menandai pesannya gagal — pesannya sendiri sudah terkirim.
			turnError = { note: e.status === 402 ? 'saldo' : 'server' };
		} else {
			// Error jaringan di sisi kita, tapi pesan sudah tercatat: orkestrasi
			// kemungkinan masih berjalan di server tanpa kita pegang HTTP-nya.
			// Biarkan poller tetap hidup sebentar supaya giliran delegasi/balasan
			// agent tetap muncul live. (ApiError = server sudah menutup run;
			// tidak ada lagi yang perlu ditunggu.)
			await new Promise((r) => setTimeout(r, WATCH_MS));
			await fetchThread().catch(() => {});
		}
	} finally {
		turnController = null;
		clearInterval(poller);
		thinking = false;
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
	get turnError() {
		return turnError;
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
		pendingBaseline = new Set(serverMsgs.map((m) => m.id));
		pending = msg;
		// @mention specialist → langsung ke endpoint-nya; selain itu ke Ava.
		await runTurn(trimmed, msg, routeAgent(trimmed));
	},

	/** Batalkan POST agent yang sedang in-flight (tombol kirim jadi tombol stop
	    selama giliran berjalan). Hanya memutus request HTTP — yang sudah
	    telanjur dipersist backend dibiarkan; fetch berikutnya merekonsiliasi. */
	cancelTurn() {
		turnController?.abort();
	},

	/** Kirim ulang pesan optimistis yang gagal. @param {string} id */
	async retry(id) {
		const msg = pending;
		if (busy || !msg || msg.id !== id || !msg.text) return;
		msg.status = 'sending';
		msg.errorNote = undefined;
		// Rekonsiliasi dulu dengan thread server: POST sebelumnya bisa saja
		// sudah mempersist pesan ini walau respons HTTP-nya gagal sampai ke
		// kita. Kirim ulang tanpa cek = pesan dobel = agent terpicu dua kali.
		try {
			await fetchThread();
		} catch {
			/* gagal cek → anggap belum terkirim, lanjut jalur kirim ulang biasa */
		}
		if (busy || pending !== msg) {
			// `pending !== msg`: pesan ternyata sudah tercatat di server
			// (fetchThread barusan melepasnya dari pending) — jangan POST ulang;
			// balasan agent, kalau run server masih hidup, ikut terambil oleh
			// sinkronisasi barusan atau muat berikutnya. `busy`: guard di atas
			// dicek SEBELUM await — klik "Coba lagi" kedua yang menyusul selama
			// rekonsiliasi bisa lolos guard itu, jadi dicek ulang di sini supaya
			// tidak ada dua runTurn (dua POST agent) untuk pesan yang sama.
			return;
		}
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
		pendingBaseline = new Set();
		thinking = false;
		busy = false;
		turnError = null;
	},

	/** Reset state lokal (dipanggil saat logout). */
	reset() {
		serverMsgs = [];
		pending = null;
		pendingBaseline = new Set();
		thinking = false;
		busy = false;
		loaded = false;
		turnError = null;
	}
};
