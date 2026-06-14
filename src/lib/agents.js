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
		role: 'orkestrator',
		init: 'A',
		varc: 'var(--ava)',
		desc: 'Orkestrator. Dengerin kamu, lalu koordinasiin tim buat ngerjain.'
	},
	zee: {
		id: 'zee',
		name: 'Zee',
		role: 'cahaya & suasana',
		init: 'Z',
		varc: 'var(--zee)',
		desc: 'Atur cahaya & suasana — lampu, tirai, dan mood ruangan.'
	},
	yori: {
		id: 'yori',
		name: 'Yori',
		role: 'musik & audio',
		init: 'Y',
		varc: 'var(--yori)',
		desc: 'Urus musik & audio — playlist, volume, dan suara ruangan.'
	},
	niko: {
		id: 'niko',
		name: 'Niko',
		role: 'dapur & sajian',
		init: 'N',
		varc: 'var(--niko)',
		desc: 'Siapin sajian — kopi, teh, dan cemilan langsung dari dapur.'
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
		text: 'Pagi. Hari ini pengen santai di rumah aja.',
		time: '08:12'
	},
	{
		id: 2,
		from: 'ava',
		type: 'text',
		text: 'Pagi. Enak banget tuh buat ngademin pikiran. Mau aku bantu siapin suasananya?',
		time: '08:12'
	},
	{ id: 3, from: 'human', type: 'text', text: 'Boleh. Mau ke teras baca buku nih.', time: '08:13' },
	{ id: 4, from: 'ava', type: 'text', text: '@zee', time: '08:13' },
	{
		id: 5,
		from: 'zee',
		type: 'text',
		text: 'Udah aku nyalain lampu teras dan buka tirainya sedikit, biar cahayanya pas buat baca. Selamat menikmati.',
		time: '08:13'
	},
	{
		id: 6,
		from: 'human',
		type: 'image',
		src: '/sample-photo.svg',
		caption: 'View-nya lagi bagus banget pagi ini.',
		time: '08:15'
	},
	{
		id: 7,
		from: 'ava',
		type: 'text',
		text: 'Cakep. Pas banget sama cuaca cerahnya. Mau ditemenin musik pelan?',
		time: '08:15'
	},
	{ id: 8, from: 'human', type: 'text', text: 'Boleh, yang kalem aja.', time: '08:16' },
	{ id: 9, from: 'ava', type: 'text', text: '@yori tolong ya, yang kalem.', time: '08:16' },
	{
		id: 10,
		from: 'yori',
		type: 'text',
		text: 'Siap. Aku puterin playlist akustik pagi, volume aku kecilin ke 20% biar nggak ganggu bacaan.',
		time: '08:16'
	},
	{ id: 11, from: 'human', type: 'text', text: 'Tolong siapin kopi', time: '08:18' },
	{ id: 12, from: 'ava', type: 'text', text: 'Noted. @niko bikinin kopinya ya.', time: '08:18' },
	{
		id: 13,
		from: 'niko',
		type: 'text',
		text: 'Kopi tubruk lagi diseduh, kira-kira 4 menit lagi siap. Nanti aku anter ke teras.',
		time: '08:18'
	},
	{ id: 14, from: 'human', type: 'text', text: 'Mantap, makasih semuanya.', time: '08:19' },
	{
		id: 15,
		from: 'ava',
		type: 'text',
		text: 'Sama-sama. Selamat nyantai ya, panggil aja kalau butuh apa-apa.',
		time: '08:19'
	}
];

export const SEED_POSTERA = [
	{
		id: 1,
		message:
			'Human meminta gorden teras ditutup pukul 17.00. Sekarang sudah waktunya, perintahkanlah Zee untuk menutup gorden teras..',
		awaken_at: '17:00'
	},
	{
		id: 2,
		message: 'Ingatkan human untuk minum air. Human diketahui jarang minum di sore hari.',
		awaken_at: '19:30'
	},
	{
		id: 3,
		message: 'Playlist malam sudah diqueue sejak tadi. Aktifkan mode tenang via Yori sekarang.',
		awaken_at: '21:00'
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
