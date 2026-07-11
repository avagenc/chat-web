/* App-wide UI/session state: auth gate, which panel/view is open,
   lightbox, toast, and search. Runes-in-module — import `session`
   anywhere and read/write its properties.

   Auth sekarang Firebase beneran (Google sign-in), bukan boolean
   localStorage lagi. BYPASS_AUTH lama sengaja dibuang, bukan disisakan:
   dulu ia cuma melewati mock, sekarang ia berarti membolongi auth asli —
   kebutuhan reviewer diselesaikan dengan akun Google demo, bukan flag. */
import { browser } from '$app/environment';
import { watchAuth, signInWithGoogle, signOutFirebase, getIdToken } from '../firebase.js';
import { conversation } from './conversation.svelte.js';
import { posteraStore } from './postera.svelte.js';
import { wallet } from './wallet.svelte.js';

/** @type {import('firebase/auth').User | null} */
let user = $state(null);
// false sampai Firebase selesai memulihkan sesi dari storage; dipakai
// +page.svelte untuk menahan render agar user yang sudah login tidak
// melihat kedip layar Login.
let authReady = $state(false);

if (browser) {
	// key sisa era mock/simulasi — bersihkan supaya tidak nyangkut di localStorage
	// (messages & postera kini datang dari backend, bukan localStorage lagi)
	try {
		localStorage.removeItem('avagenc.authed');
		localStorage.removeItem('avagenc.messages');
		localStorage.removeItem('avagenc.postera');
	} catch {
		/* ignore */
	}
	watchAuth((u) => {
		const wasAuthed = user !== null;
		user = u;
		authReady = true;
		if (u) {
			// login (atau sesi dipulihkan): tarik data awal dari backend
			conversation.load();
			posteraStore.load().catch(() => {});
			wallet.refresh().catch(() => {});
		} else if (wasAuthed) {
			// logout: buang state milik user sebelumnya
			conversation.reset();
			posteraStore.reset();
			wallet.reset();
		}
	}).catch(() => {
		// init Firebase gagal (mis. chunk diblokir/offline): tetap tandai ready
		// supaya layar Login muncul, bukan layar polos selamanya — error
		// sesungguhnya baru di-toast saat user mencoba login.
		authReady = true;
	});
}

/** @type {'profile'|'postera'|null} */
let panel = $state(null);
/** @type {'chat'|'info'} */
let view = $state('chat');
/** @type {string|null} */
let lightbox = $state(null); // image src
/** @type {string|null} */
let toast = $state(null);
let search = $state({ active: false, query: '', idx: 0 });

/** @type {ReturnType<typeof setTimeout>} */
let toastTimer;

/** @param {string} text */
function flashToast(text) {
	toast = text;
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => (toast = null), 2200);
}

export const session = {
	get authed() {
		return user !== null;
	},
	/** true setelah Firebase selesai memulihkan sesi (login maupun tidak) */
	get ready() {
		return authReady;
	},
	get user() {
		return user;
	},
	/** Identitas tampilan dari akun Google yang sedang login. */
	get profile() {
		const name = user?.displayName || user?.email || 'Human';
		return {
			name,
			email: user?.email ?? '',
			initial: (name[0] || 'H').toUpperCase()
		};
	},
	get panel() {
		return panel;
	},
	set panel(v) {
		panel = v;
	},
	get view() {
		return view;
	},
	set view(v) {
		view = v;
	},
	get lightbox() {
		return lightbox;
	},
	set lightbox(v) {
		lightbox = v;
	},
	get toast() {
		return toast;
	},
	get search() {
		return search;
	},
	set search(v) {
		search = v;
	},

	// Kontrak lama dipertahankan: Login.svelte tetap memanggil session.login().
	// `authed` baru berubah lewat watchAuth, bukan di-set langsung di sini.
	async login() {
		try {
			await signInWithGoogle();
		} catch (e) {
			const code = /** @type {{ code?: string }} */ (e)?.code;
			// user menutup popup sendiri / klik ulang saat popup masih ada — bukan error
			if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
			flashToast(
				code === 'auth/popup-blocked'
					? 'Popup diblokir browser. Izinkan popup, lalu coba lagi.'
					: 'Gagal masuk. Coba lagi.'
			);
		}
	},
	async logout() {
		panel = null;
		try {
			await signOutFirebase();
		} catch {
			flashToast('Gagal keluar. Coba lagi.');
		}
	},
	/**
	 * ID token Firebase user aktif — dipakai api.js untuk header
	 * `Authorization: Bearer` ke backend.
	 * @returns {Promise<string|null>}
	 */
	getToken() {
		return getIdToken();
	},
	/** @param {'profile'|'postera'} name */
	togglePanel(name) {
		panel = panel === name ? null : name;
	},
	flashToast,

	// ---- search controls ----
	openSearch() {
		panel = null;
		view = 'chat';
		search = { active: true, query: '', idx: 0 };
	},
	closeSearch() {
		search = { active: false, query: '', idx: 0 };
	}
};
