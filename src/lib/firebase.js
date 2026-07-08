/* Firebase Auth (Google sign-in saja) — lingkup frontend.
   Semua modul SDK di-`import()` dinamis di dalam fungsi dan init-nya lazy
   (singleton), jadi tidak ada kode Firebase yang ter-evaluate saat
   prerender/build di Node — SDK auth menyentuh window/IndexedDB saat init.
   Persistensi sesi & refresh token diurus SDK (default: IndexedDB). */
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

/** @type {Promise<import('firebase/auth').Auth> | null} */
let authPromise = null;

/** Instance Auth singleton — hanya boleh dipanggil di browser. */
function getFirebaseAuth() {
	if (!browser) throw new Error('Firebase hanya diinisialisasi di browser');
	authPromise ??= (async () => {
		const { initializeApp } = await import('firebase/app');
		const { getAuth } = await import('firebase/auth');
		const app = initializeApp({
			apiKey: env.PUBLIC_FIREBASE_API_KEY,
			authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
			projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
			appId: env.PUBLIC_FIREBASE_APP_ID
		});
		return getAuth(app);
	})();
	return authPromise;
}

/**
 * Pantau status auth Firebase. Callback pertama menandakan sesi selesai
 * dipulihkan dari storage (user ada, atau memang null).
 * @param {(user: import('firebase/auth').User | null) => void} cb
 */
export async function watchAuth(cb) {
	const auth = await getFirebaseAuth();
	const { onAuthStateChanged } = await import('firebase/auth');
	onAuthStateChanged(auth, cb);
}

/**
 * Login Google via popup. Error popup (ditutup/diblokir) dilempar apa adanya
 * dengan `code` `auth/*` — pemanggil yang memutuskan mana yang perlu toast.
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function signInWithGoogle() {
	const auth = await getFirebaseAuth();
	const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
	const cred = await signInWithPopup(auth, new GoogleAuthProvider());
	return cred.user;
}

export async function signOutFirebase() {
	const auth = await getFirebaseAuth();
	const { signOut } = await import('firebase/auth');
	await signOut(auth);
}

/**
 * ID token user aktif — bahan header `Authorization: Bearer <token>` untuk
 * backend. SDK me-refresh token kedaluwarsa otomatis.
 * @returns {Promise<string|null>} null kalau belum login
 */
export async function getIdToken() {
	const auth = await getFirebaseAuth();
	return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
