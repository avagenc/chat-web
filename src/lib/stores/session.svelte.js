/* App-wide UI/session state: auth gate, which panel/view is open,
   lightbox, toast, and search. Runes-in-module — import `session`
   anywhere and read/write its properties.

   Auth sekarang Firebase beneran (Google sign-in), bukan boolean
   localStorage lagi. BYPASS_AUTH lama sengaja dibuang, bukan disisakan:
   dulu ia cuma melewati mock, sekarang ia berarti membolongi auth asli —
   kebutuhan reviewer diselesaikan dengan akun Google demo, bukan flag. */
import { browser } from '$app/environment';
import { watchAuth, signInWithGoogle, signOutFirebase, getIdToken } from '../firebase.js';

/** @type {import('firebase/auth').User | null} */
let user = $state(null);
// false sampai Firebase selesai memulihkan sesi dari storage; dipakai
// +page.svelte untuk menahan render agar user yang sudah login tidak
// melihat kedip layar Login.
let authReady = $state(false);

if (browser) {
	// key sisa era auth mock — bersihkan supaya tidak nyangkut di localStorage
	try {
		localStorage.removeItem('avagenc.authed');
	} catch {
		/* ignore */
	}
	watchAuth((u) => {
		user = u;
		authReady = true;
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
	 * ID token Firebase user aktif — untuk `Authorization: Bearer` saat
	 * backend asli di-wire nanti (belum dipakai; orchestrator masih simulasi).
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
