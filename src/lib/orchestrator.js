/* ============================================================
   Avagenc — reply orchestration (keyword router + reply pools)
   ported from reference/data.jsx (planReply) + app.jsx (replies)
   ============================================================ */
import { pick } from './agents.js';

/** @param {number} ms */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const IMAGE_REPLIES = [
	'Wah, adem banget kelihatannya. Mau aku siapin sesuatu biar makin nyaman?',
	'Cakep fotonya. Suasananya pas buat santai ya.',
	'Bagus banget pencahayaannya. Mau ditemenin musik pelan nggak?'
];

// returns an ordered list of agent turns to play out after a human message
/** @param {string} userText @returns {{ from: string, text: string }[]} */
export function planReply(userText) {
	const t = (userText || '').toLowerCase();
	/** @param {...string} words */
	const has = (...words) => words.some((w) => t.includes(w));

	// lights / ambiance -> Zee
	if (
		has(
			'lampu',
			'terang',
			'gelap',
			'tirai',
			'teras',
			'redup',
			'suasana',
			'cahaya',
			'ac',
			'adem',
			'dingin',
			'panas'
		)
	) {
		return [
			{ from: 'ava', text: pick(['@zee', '@zee tolong ya.', 'Bentar, @zee bantuin.']) },
			{
				from: 'zee',
				text: pick([
					'Udah aku atur lampunya jadi lebih hangat dan tirai aku sesuaikan. Lebih nyaman sekarang?',
					'Beres. Lampu teras nyala, tirai aku buka separuh biar cahayanya lembut.',
					'Aku redupin lampu ruang tengah dan nyalain lampu baca. Pas buat santai.'
				])
			}
		];
	}
	// music / audio -> Yori
	if (
		has(
			'musik',
			'lagu',
			'playlist',
			'volume',
			'suara',
			'putar',
			'puter',
			'audio',
			'kalem',
			'akustik'
		)
	) {
		return [
			{ from: 'ava', text: pick(['@yori', '@yori tolong ya.', 'Oke, @yori aku mintain tolong.']) },
			{
				from: 'yori',
				text: pick([
					'Siap. Aku puterin playlist akustik yang kalem, volumenya aku jaga pelan.',
					'Udah jalan. Lagu-lagu instrumental ya, biar fokus tetap kebawa.',
					'Aku ganti ke mode santai, volume di 25%. Bilang aja kalau mau diganti.'
				])
			}
		];
	}
	// food / drink -> Niko
	if (
		has(
			'kopi',
			'teh',
			'makan',
			'laper',
			'lapar',
			'minum',
			'cemilan',
			'snack',
			'sarapan',
			'dapur',
			'seduh',
			'haus'
		)
	) {
		return [
			{ from: 'ava', text: pick(['@niko', '@niko bantuin ya.', 'Bentar, @niko aku panggil.']) },
			{
				from: 'niko',
				text: pick([
					'Lagi aku siapin. Kira-kira beberapa menit lagi ya, nanti aku anter.',
					'Siap. Kopinya aku seduh sekarang, mau yang agak manis atau plain?',
					'Beres, lagi aku rapihin di dapur. Sebentar lagi sampai.'
				])
			}
		];
	}
	// greetings / thanks / smalltalk -> Ava direct
	if (has('makasih', 'terima kasih', 'thanks', 'thank')) {
		return [
			{
				from: 'ava',
				text: pick([
					'Sama-sama. Seneng bisa bantu.',
					'Dengan senang hati. Panggil aja kalau ada lagi.'
				])
			}
		];
	}
	if (has('pagi', 'siang', 'sore', 'malam', 'halo', 'hai', 'hi ')) {
		return [
			{
				from: 'ava',
				text: pick(['Hai. Lagi pengen ngapain hari ini?', 'Halo. Ada yang bisa aku bantu siapin?'])
			}
		];
	}
	// fallback -> Ava direct
	return [
		{
			from: 'ava',
			text: pick([
				'Oke, aku catat. Mau aku bantu atur sesuatu di rumah, atau ngobrol aja dulu?',
				'Siap. Kalau butuh aku nyalain sesuatu atau puterin musik, tinggal bilang ya.',
				'Hmm, boleh cerita lebih lanjut? Nanti aku bantu koordinasiin sama yang lain.',
				'Noted. Aku di sini kalau butuh apa-apa.'
			])
		}
	];
}
