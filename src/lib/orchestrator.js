/* ============================================================
   Avagenc — reply orchestration (keyword router + reply pools)
   ported from reference/data.jsx (planReply) + app.jsx (replies)
   ============================================================ */
import { pick } from './agents.js';

/** @param {number} ms */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const IMAGE_REPLIES = [
	'Cakep fotonya. Mau aku catat momen ini, atau ada yang bisa aku bantu dari sini?',
	'Bagus banget. Kalau mau, aku bisa setel musik yang pas buat suasana ini.',
	'Noted, fotonya udah aku terima. Ada yang mau ditindaklanjuti?'
];

// returns an ordered list of agent turns to play out after a human message
/** @param {string} userText @returns {{ from: string, text: string }[]} */
export function planReply(userText) {
	const t = (userText || '').toLowerCase();
	/** @param {...string} words */
	const has = (...words) => words.some((w) => t.includes(w));

	// ---- starter-bubble scenarios (handled by Ava directly) ----

	// "Kenalan dong!" -> Ava introduces the team
	if (has('kenalan', 'kenalin', 'perkenalan', 'siapa aja', 'siapa kalian', 'siapa kamu')) {
		return [
			{
				from: 'ava',
				text: 'Halo, aku Ava — orkestrator Avagenc sekaligus yang pegang Spotify buat play/pause musik. Aku nggak kerja sendirian: ada @zee yang ngurus smart home lewat Tuya (lampu, AC, colokan), @yori untuk Gmail (baca & kirim email), dan @rafal yang pegang Google Calendar (jadwal & bikin acara). Tinggal bilang butuhnya apa, nanti aku arahin ke yang tepat.'
			}
		];
	}

	// "Avagenc Chat nih apa ya?" -> Ava explains the product
	if (has('avagenc chat', 'avagenc nih', 'apa ya', 'apa itu', 'apaan', 'buat apa', 'fungsinya')) {
		return [
			{
				from: 'ava',
				text: 'Avagenc Chat itu satu ruang obrolan buat ngendaliin asisten-asisten kamu dari satu tempat — kamu cukup ngobrol biasa ke aku, nanti aku yang koordinasiin tim. Contohnya: minta "cek email" → aku lempar ke Yori, "ada acara apa hari ini" → ke Rafal, "nyalain lampu" → ke Zee, dan kalau soal musik aku handle sendiri lewat Spotify. Coba aja langsung 😉'
			}
		];
	}

	// "Kamu bisa bantu apa aja?" -> Ava lists the team's capabilities
	if (
		has(
			'bisa bantu apa',
			'bisa apa aja',
			'bantu apa aja',
			'bisa ngapain',
			'kemampuan',
			'fitur apa',
			'apa aja yang bisa'
		)
	) {
		return [
			{
				from: 'ava',
				text: 'Banyak! Aku koordinasiin tim biar kamu cukup ngobrol dari satu tempat. Aku sendiri pegang Spotify (play, pause, ganti lagu), @yori urusan Gmail (baca, rangkum, kirim email), @rafal pegang Google Calendar (lihat jadwal & bikin acara), dan @zee kontrol perangkat rumah lewat Tuya. Mau coba salah satu sekarang?'
			}
		];
	}

	// "Spotifyku udah terhubung apa belum?" -> Ava checks Spotify status
	if (has('spotify', 'terhubung', 'tersambung', 'connect', 'tehubung', 'nyambung')) {
		return [
			{
				from: 'ava',
				text: pick([
					'Spotify kamu udah terhubung kok ✅ Akun premium, device aktif: "Ruang Kerja". Mau aku setelin lagu sekarang?',
					'Udah connect ✅ Aku bisa langsung play, pause, atau ganti lagu kapan aja. Mau mulai dari playlist apa?'
				])
			}
		];
	}

	// ---- capability routing ----

	// music / Spotify -> Ava handles directly (she holds Spotify)
	if (
		has(
			'musik',
			'lagu',
			'playlist',
			'putar',
			'puter',
			'setel',
			'nyetel',
			'play',
			'pause',
			'stop lagu',
			'volume',
			'spotify',
			'akustik',
			'kalem'
		)
	) {
		return [
			{
				from: 'ava',
				text: pick([
					'Sip, ini aku pegang langsung. Aku play playlist santai di Spotify, volume aku jaga pelan. Bilang aja kalau mau di-pause atau ganti.',
					'Oke, aku setel lagunya sekarang lewat Spotify. Lagi aku puter yang kalem dulu ya.',
					'Beres, musiknya jalan. Mau lanjut ke playlist berikutnya atau cukup yang ini?'
				])
			}
		];
	}
	// email / Gmail -> Yori
	if (
		has('email', 'e-mail', 'mail', 'gmail', 'inbox', 'surel', 'pesan masuk', 'balas', 'kirim ke')
	) {
		return [
			{ from: 'ava', text: pick(['@yori', '@yori cek ya.', 'Oke, @yori aku mintain tolong.']) },
			{
				from: 'yori',
				text: pick([
					'Aku cek inbox-nya ya. Ada beberapa email baru — mau aku rangkum yang penting aja atau semuanya?',
					'Siap. Email-nya udah aku buka. Mau aku draft-in balasannya sekalian?',
					'Oke, aku susun emailnya sekarang. Konfirmasi dulu isinya sebelum aku kirim ya.'
				])
			}
		];
	}
	// calendar -> Rafal
	if (
		has(
			'kalender',
			'kalendar',
			'jadwal',
			'jadwalin',
			'acara',
			'agenda',
			'meeting',
			'rapat',
			'event',
			'janji',
			'reminder',
			'ingetin'
		)
	) {
		return [
			{
				from: 'ava',
				text: pick(['@rafal', '@rafal cek kalender ya.', 'Bentar, @rafal aku panggil.'])
			},
			{
				from: 'rafal',
				text: pick([
					'Aku cek Google Calendar-nya. Hari ini ada beberapa acara — mau aku bacain satu-satu?',
					'Siap. Acaranya udah aku tambahin ke kalendermu, lengkap sama pengingatnya.',
					'Oke. Jadwalmu hari ini relatif longgar, slot kosong masih banyak di sore hari.'
				])
			}
		];
	}
	// smart home / Tuya devices -> Zee
	if (
		has(
			'lampu',
			'terang',
			'gelap',
			'tirai',
			'gorden',
			'redup',
			'cahaya',
			'ac',
			'dingin',
			'panas',
			'colokan',
			'saklar',
			'kipas',
			'perangkat',
			'device',
			'tuya',
			'nyalain',
			'matiin',
			'hidupin'
		)
	) {
		return [
			{ from: 'ava', text: pick(['@zee', '@zee tolong ya.', 'Bentar, @zee bantuin.']) },
			{
				from: 'zee',
				text: pick([
					'Udah aku atur perangkatnya lewat Tuya. Lebih nyaman sekarang?',
					'Beres. Lampu aku sesuaikan dan AC aku set ke 24°C.',
					'Oke, devicenya udah aku kontrol. Bilang aja kalau mau diubah lagi.'
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
				text: pick([
					'Hai. Mau aku bantu apa hari ini — cek email, lihat jadwal, atur perangkat, atau setel musik?',
					'Halo. Ada yang bisa aku bantu? Tinggal bilang aja.'
				])
			}
		];
	}
	// fallback -> Ava direct
	return [
		{
			from: 'ava',
			text: pick([
				'Oke, aku catat. Mau aku bantu cek email, lihat kalender, atur perangkat rumah, atau setel musik?',
				'Siap. Aku bisa koordinasiin Yori (email), Rafal (kalender), Zee (smart home), atau pegang musik sendiri. Mau yang mana?',
				'Hmm, boleh perjelas dikit? Nanti aku arahin ke agen yang tepat.',
				'Noted. Aku di sini kalau butuh apa-apa.'
			])
		}
	];
}
