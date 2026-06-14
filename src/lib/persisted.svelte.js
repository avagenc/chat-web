/* localStorage-backed $state helper.
   usage: const messages = persisted('avagenc.messages', SEED)
          messages.value  // read (reactive)
          messages.value = next  // write (persists)
   Keys mirror the prototype: avagenc.authed, avagenc.messages, avagenc.postera.
   Note: values are stored as JSON (authed is a boolean, not "1"/"0"). */
/**
 * @template T
 * @param {string} key
 * @param {T} initial
 * @returns {{ value: T }}
 */
export function persisted(key, initial) {
	let value = $state(load(key, initial));
	$effect.root(() => {
		$effect(() => {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch {
				/* ignore quota / privacy-mode errors */
			}
		});
	});
	return {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		}
	};
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function load(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (raw) return JSON.parse(raw);
	} catch {
		/* ignore */
	}
	return structuredClone(fallback);
}
