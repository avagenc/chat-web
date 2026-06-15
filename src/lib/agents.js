/* ============================================================
   Avagenc — agents, user, seed data, time/wave helpers
   (ported from reference/data.jsx + USER from screens.jsx)
   ============================================================ */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} init
 * @property {string} varc
 * @property {string} desc
 */

/** @type {Record<string, Agent>} */
export const AGENTS = {
	ava: {
		id: 'ava',
		name: 'Ava',
		role: 'orkestrator & musik',
		init: 'A',
		varc: 'var(--ava)',
		desc: 'Orkestrator. Dengerin kamu, koordinasiin tim — sekaligus pegang Spotify buat play, pause, dan ganti lagu.'
	},
	zee: {
		id: 'zee',
		name: 'Zee',
		role: 'smart home',
		init: 'Z',
		varc: 'var(--zee)',
		desc: 'Tuya smart agent. Kontrol perangkat rumah — lampu, AC, colokan, dan device Tuya lainnya.'
	},
	yori: {
		id: 'yori',
		name: 'Yori',
		role: 'email',
		init: 'Y',
		varc: 'var(--yori)',
		desc: 'Gmail agent. Baca, rangkum, tulis, dan kirim email lewat akun Gmail-mu.'
	},
	rafal: {
		id: 'rafal',
		name: 'Rafal',
		role: 'kalender',
		init: 'R',
		varc: 'var(--rafal)',
		desc: 'Google Calendar agent. Lihat jadwal dan bikin acara baru di kalendermu.'
	}
};

export const AGENT_LIST = Object.values(AGENTS);

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {string} from
 * @property {'text'|'image'} type
 * @property {string} [text]
 * @property {string} [caption]
 * @property {string} [src]
 * @property {string} time
 * @property {string} [status]
 */

/**
 * @typedef {Object} Posterum
 * @property {number} id
 * @property {string} message
 * @property {string} awaken_at
 */

export const USER = {
	name: 'Ardian',
	email: 'ardian@naturallyfunny.dev',
	initial: 'A'
};

let __id = 100;
export const nextId = () => ++__id;

export const SEED = [
	{
		id: 1,
		from: 'human',
		type: 'text',
		text: 'Pagi. Bantu aku siap-siap mulai hari dong.',
		time: '08:12'
	},
	{
		id: 2,
		from: 'ava',
		type: 'text',
		text: 'Pagi, Ardian. Siap. Mau aku mulai dari mana — cek jadwal, cek email, atau setel musik dulu?',
		time: '08:12'
	},
	{
		id: 3,
		from: 'human',
		type: 'text',
		text: 'Setel musik dulu deh biar semangat.',
		time: '08:13'
	},
	{
		id: 4,
		from: 'ava',
		type: 'text',
		text: 'Sip, ini aku pegang langsung. Aku play playlist "Morning Boost" di Spotify, volume aku set ke 30%. Tinggal bilang kalau mau di-pause.',
		time: '08:13'
	},
	{
		id: 5,
		from: 'human',
		type: 'text',
		text: 'Mantap. Hari ini ada acara apa aja di kalender?',
		time: '08:14'
	},
	{ id: 6, from: 'ava', type: 'text', text: '@rafal cek kalender hari ini ya.', time: '08:14' },
	{
		id: 7,
		from: 'rafal',
		type: 'text',
		text: 'Hari ini ada 2 acara: "Standup tim" jam 09:30 dan "Review desain Avagenc" jam 14:00. Sisanya kosong, jadi siang agak longgar.',
		time: '08:14'
	},
	{
		id: 8,
		from: 'human',
		type: 'text',
		text: 'Oke. Ada email penting yang masuk semalam nggak?',
		time: '08:15'
	},
	{ id: 9, from: 'ava', type: 'text', text: '@yori coba rangkum inbox-nya.', time: '08:15' },
	{
		id: 10,
		from: 'yori',
		type: 'text',
		text: 'Ada 3 email baru. Yang penting satu: dari klien soal jadwal demo minggu depan, minta konfirmasi. Dua sisanya newsletter. Mau aku draft-in balasannya?',
		time: '08:15'
	},
	{
		id: 11,
		from: 'human',
		type: 'text',
		text: 'Nanti aja balasnya. Tolong nyalain AC ruang kerja.',
		time: '08:17'
	},
	{
		id: 12,
		from: 'ava',
		type: 'text',
		text: 'Noted. @zee nyalain AC ruang kerja ya.',
		time: '08:17'
	},
	{
		id: 13,
		from: 'zee',
		type: 'text',
		text: 'AC ruang kerja udah nyala, aku set ke 24°C. Lampu mejanya sekalian aku nyalain biar enak kerja.',
		time: '08:17'
	},
	{ id: 14, from: 'human', type: 'text', text: 'Mantap, makasih semuanya.', time: '08:19' },
	{
		id: 15,
		from: 'ava',
		type: 'text',
		text: 'Sama-sama. Nanti jam 9:15 aku ingetin lagi sebelum standup ya. Selamat beraktivitas.',
		time: '08:19'
	}
];

export const SEED_POSTERA = [
	{
		id: 1,
		message:
			'Ingatkan human 15 menit sebelum "Standup tim" jam 09:30. Sumber acara dari Google Calendar via Rafal.',
		awaken_at: '09:15'
	},
	{
		id: 2,
		message:
			'Human menunda membalas email klien soal jadwal demo. Perintahkan Yori menyiapkan draft balasannya sore ini.',
		awaken_at: '16:00'
	},
	{
		id: 3,
		message:
			'Sebelum acara "Review desain Avagenc" jam 14:00, suruh Zee redupkan lampu ruang kerja biar fokus.',
		awaken_at: '13:50'
	}
];

export function nowTime() {
	const d = new Date();
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
/** @param {string} [time] */
export function fullStamp(time) {
	const d = new Date();
	return `${ID_DAYS[d.getDay()]}, ${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()} · pukul ${time || nowTime()}`;
}

/** @type {<T>(arr: T[]) => T} */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
