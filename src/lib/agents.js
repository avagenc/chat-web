/* ============================================================
   Avagenc — agents & time helpers
   ============================================================ */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} init
 * @property {string} varc
 * @property {string} desc
 * @property {string} [endpoint]  route backend `POST` untuk kirim pesan langsung ke agent ini (kosong untuk teaser SOON_AGENTS)
 */

/* Tiap agent punya endpoint HTTP sendiri di backend (repo `chat`, cmd/http):
   POST /ava, /zee, /yori, /rafal. Ava = orkestrator (default). Yang lain =
   specialist yang bisa dituju langsung lewat @mention tanpa lewat Ava. */
/** @type {Record<string, Agent>} */
export const AGENTS = {
	ava: {
		id: 'ava',
		name: 'Ava',
		role: 'orkestrator',
		init: 'A',
		varc: 'var(--ava)',
		endpoint: '/ava',
		desc: 'Orkestrator. Dengerin kamu, pahami kebutuhanmu, lalu koordinasiin agent yang tepat — kamu cukup ngobrol dari satu tempat.'
	},
	zee: {
		id: 'zee',
		name: 'Zee',
		role: 'smart home (tuya smart)',
		init: 'Z',
		varc: 'var(--zee)',
		endpoint: '/zee',
		desc: 'Tuya smart agent. Kontrol perangkat rumah — lampu, AC, colokan, dan device Tuya lainnya.'
	},
	yori: {
		id: 'yori',
		name: 'Yori',
		role: 'musik (spotify)',
		init: 'Y',
		varc: 'var(--yori)',
		endpoint: '/yori',
		desc: 'Spotify music agent. Play, pause, ganti lagu, dan setelin playlist di akun Spotify-mu.'
	},
	rafal: {
		id: 'rafal',
		name: 'Rafal',
		role: 'gmail, kontak & kalender',
		init: 'R',
		varc: 'var(--rafal)',
		endpoint: '/rafal',
		desc: 'Google Workspace agent. Urus Gmail (baca, rangkum, kirim email), kontak, sampai Google Calendar (lihat jadwal & bikin acara).'
	}
};

export const AGENT_LIST = Object.values(AGENTS);

/**
 * Tentukan agent tujuan sebuah pesan dari @mention yang dikenal roster:
 * - tanpa mention → Ava (orkestrator, default);
 * - tepat satu agent yang di-mention → langsung ke agent itu (mis. "@zee nyalain
 *   lampu" masuk ke Zee tanpa lewat Ava — kalau yang di-mention Ava sendiri,
 *   ya Ava);
 * - lebih dari satu agent berbeda di-mention → Ava, supaya dia yang
 *   mengorkestrasi (perintah lintas-specialist sering butuh urutan/kerja
 *   sekuensial yang cuma Ava yang bisa koordinasikan).
 *
 * Mention berulang ke agent yang sama dihitung satu (pakai himpunan unik).
 * @param {string} text
 * @returns {Agent}
 */
export function routeAgent(text) {
	/** @type {Set<string>} */
	const mentioned = new Set();
	for (const m of (text || '').matchAll(/@(\w+)/g)) {
		const id = m[1].toLowerCase();
		if (id in AGENTS) mentioned.add(id);
	}
	if (mentioned.size === 1) {
		const [only] = mentioned;
		return AGENTS[only];
	}
	return AGENTS.ava;
}

/**
 * Teaser agents — "segera hadir". Sengaja DIPISAH dari AGENTS: mereka cuma tampil
 * sebagai teaser di panel info, tidak bisa di-@mention, dan tidak pernah jadi
 * pengirim pesan. Jangan masukkan ke AGENTS sampai backend-nya benar-benar ada.
 * @type {Agent[]}
 */
export const SOON_AGENTS = [
	{
		id: 'gojo',
		name: 'Gojo',
		role: 'transport & makanan (gojek)',
		init: 'G',
		varc: 'var(--gojo)',
		desc: 'Gojek agent. Pesan GoRide & GoCar, jajan lewat GoFood, sampai kirim barang via GoSend.'
	},
	{
		id: 'sophie',
		name: 'Sophie',
		role: 'belanja (shopee)',
		init: 'S',
		varc: 'var(--sophie)',
		desc: 'Shopee agent. Cariin barang, bandingin harga, lacak paket, dan checkout keranjang.'
	}
];

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} from
 * @property {'text'|'image'} type
 * @property {string} [text]
 * @property {string} [caption]
 * @property {string} [src]
 * @property {string} time  jam tampil "HH:MM"
 * @property {string} [at]  timestamp ISO dari backend (untuk stamp lengkap)
 * @property {string} [status]
 * @property {string} [errorNote] penyebab gagal kirim — 'saldo' = 402 dari backend
 */

/**
 * @typedef {Object} Posterum
 * @property {string} id
 * @property {string} message
 * @property {string} awaken_at  label waktu bangun yang sudah diformat
 */

export function nowTime() {
	const d = new Date();
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** @param {string|undefined} iso @returns {string} "HH:MM" lokal */
export function clockTime(iso) {
	const d = iso ? new Date(iso) : new Date();
	if (Number.isNaN(d.getTime())) return nowTime();
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// full, human timestamp for a message bubble — down to the minute, never seconds
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const ID_MONTHS = [
	'Januari',
	'Februari',
	'Maret',
	'April',
	'Mei',
	'Juni',
	'Juli',
	'Agustus',
	'September',
	'Oktober',
	'November',
	'Desember'
];
/**
 * @param {string} [time] jam "HH:MM" (fallback saat `at` tidak ada)
 * @param {string} [at] timestamp ISO pesan — dipakai agar tanggalnya ikut tanggal pesan, bukan hari ini
 */
export function fullStamp(time, at) {
	const parsed = at ? new Date(at) : new Date();
	const d = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
	return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()} · pukul ${time || clockTime(at)}`;
}
