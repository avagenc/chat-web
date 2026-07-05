/* Klien HTTP ke backend Avagenc Chat (cmd/http di repo `chat`).
   Semua route user di belakang auth Firebase: kirim `Authorization: Bearer
   <ID token>`. Route agent & memory juga butuh header `session-id` dan
   `time-zone` (IANA) — dikirim selalu karena tidak pernah mengganggu route
   yang tidak memakainya. Error backend berbentuk problem JSON `{detail}` dan
   dilempar sebagai ApiError supaya pemanggil bisa cabang per-status
   (mis. 402 saldo habis, 404 sesi belum ada). */
import { PUBLIC_API_BASE } from '$env/static/public';
import { getIdToken, getUid } from './firebase.js';

const BASE = PUBLIC_API_BASE.replace(/\/+$/, '');

export class ApiError extends Error {
	/** @param {number} status @param {string} detail */
	constructor(status, detail) {
		super(`API ${status}: ${detail}`);
		this.status = status;
		this.detail = detail;
	}
}

/** Timezone IANA browser — backend menjadwalkan & memfilter "hari ini" dengan ini. */
export function timezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
	} catch {
		return 'Asia/Jakarta';
	}
}

/**
 * ID sesi chat — deterministik per user supaya riwayat nyambung lintas
 * device/reload (backend auto-create thread Zep pada run pertama; postera
 * me-round-trip id ini saat Ava bangun sendiri).
 * @returns {Promise<string>}
 */
export async function sessionId() {
	const uid = await getUid();
	if (!uid) throw new ApiError(401, 'belum login');
	return `chat-${uid}`;
}

/**
 * @param {string} path mis. '/ava'
 * @param {{ method?: string, body?: unknown }} [opts]
 * @returns {Promise<any>} JSON hasil, atau null untuk 204
 */
export async function api(path, opts = {}) {
	const token = await getIdToken();
	if (!token) throw new ApiError(401, 'belum login');
	const sid = await sessionId();
	const res = await fetch(BASE + path, {
		method: opts.method ?? 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'session-id': sid,
			'time-zone': timezone(),
			...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {})
		},
		body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
	});
	if (res.status === 204) return null;
	if (!res.ok) {
		let detail = res.statusText;
		try {
			const problem = await res.json();
			if (problem && typeof problem.detail === 'string') detail = problem.detail;
		} catch {
			/* body bukan JSON — pakai statusText */
		}
		throw new ApiError(res.status, detail);
	}
	return res.json();
}
