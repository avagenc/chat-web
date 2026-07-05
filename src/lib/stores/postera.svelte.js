/* Postera: daftar posterum (pesan wake-up yang Ava jadwalkan untuk dirinya
   sendiri) dari backend — GET /postera, batalkan via DELETE /postera/{id}.
   Backend mengembalikan field Go apa adanya (ID, Message, TriggerAt RFC3339);
   di sini dipetakan ke bentuk UI dengan label waktu yang sudah diformat. */
import { api } from '../api.js';
import { nowTime } from '../agents.js';

/** @typedef {import('../agents.js').Posterum} Posterum */

const ID_MONTHS_SHORT = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'Mei',
	'Jun',
	'Jul',
	'Agu',
	'Sep',
	'Okt',
	'Nov',
	'Des'
];

/** Label waktu bangun: "HH:MM" kalau hari ini, selain itu "5 Jul · HH:MM". @param {string} iso */
function awakenLabel(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	const now = new Date();
	const sameDay =
		d.getDate() === now.getDate() &&
		d.getMonth() === now.getMonth() &&
		d.getFullYear() === now.getFullYear();
	return sameDay ? hhmm : `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} · ${hhmm}`;
}

/** @type {Posterum[]} */
let list = $state([]);
/** @type {string|null} jam "HH:MM" fetch terakhir yang sukses */
let lastFetched = $state(null);

export const posteraStore = {
	get list() {
		return list;
	},
	get lastFetched() {
		return lastFetched;
	},

	async load() {
		/** @type {{ ID: string, Message: string, TriggerAt: string }[] | null} */
		const entries = await api('/postera');
		list = (entries ?? []).map((p) => ({
			id: p.ID,
			message: p.Message,
			awaken_at: awakenLabel(p.TriggerAt)
		}));
		lastFetched = nowTime();
	},

	/** @param {string} id */
	async cancel(id) {
		await api(`/postera/${encodeURIComponent(id)}`, { method: 'DELETE' });
		list = list.filter((x) => x.id !== id);
	},

	reset() {
		list = [];
		lastFetched = null;
	}
};
