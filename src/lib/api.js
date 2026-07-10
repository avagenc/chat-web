/* Klien HTTP ke backend Avagenc Chat (cmd/http di repo `chat`).
   Semua route user di belakang auth Firebase: kirim `Authorization: Bearer
   <ID token>`. Route agent & wallet-usage juga butuh header `time-zone`
   (IANA) — dikirim selalu karena tidak pernah mengganggu route yang tidak
   memakainya. Sesi chat TIDAK dikirim dari sini: backend single-session,
   menurunkan `chat-<uid>` sendiri dari token di semua entry point. Error
   backend berbentuk problem JSON `{detail}` dan dilempar sebagai ApiError
   supaya pemanggil bisa cabang per-status (mis. 402 saldo habis, 404 sesi
   belum ada). */
import { env } from '$env/dynamic/public';
import { getIdToken } from './firebase.js';

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
 * @param {string} path mis. '/ava'
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [opts]
 * @returns {Promise<any>} JSON hasil, atau null untuk 204
 */
export async function api(path, opts = {}) {
	const token = await getIdToken();
	if (!token) throw new ApiError(401, 'belum login');
	const base = (env.PUBLIC_API_BASE || '').replace(/\/+$/, '');
	const res = await fetch(base + path, {
		method: opts.method ?? 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'time-zone': timezone(),
			...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {})
		},
		body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
		signal: opts.signal
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
