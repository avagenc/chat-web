/* App-wide UI/session state: auth gate, which panel/view is open,
   lightbox, toast, and search. Runes-in-module — import `session`
   anywhere and read/write its properties. */
import { persisted } from '../persisted.svelte.js';

const BYPASS_AUTH = false;

const authedStore = persisted('avagenc.authed', false);

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

export const session = {
	get authed() {
		return BYPASS_AUTH || authedStore.value;
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

	login() {
		authedStore.value = true;
	},
	logout() {
		panel = null;
		authedStore.value = false;
	},
	/** @param {'profile'|'postera'} name */
	togglePanel(name) {
		panel = panel === name ? null : name;
	},
	/** @param {string} text */
	flashToast(text) {
		toast = text;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = null), 2200);
	},

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
