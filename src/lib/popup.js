/* One-popup-at-a-time controller — replaces window.__avagencClosePopup.
   The currently-open float registers its close handler; opening a new one
   first calls closeActivePopup() so only a single float is ever visible. */

/** @type {(() => void) | null} */
let closer = null;

/** @param {() => void} fn @returns {() => void} */
export function registerPopup(fn) {
	closer = fn;
	return () => {
		if (closer === fn) closer = null;
	};
}

export function closeActivePopup() {
	closer?.();
}
