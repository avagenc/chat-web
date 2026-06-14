/* Postera: the list of posterum messages Ava schedules for her future self. */
import { persisted } from '../persisted.svelte.js';
import { SEED_POSTERA } from '../agents.js';

/** @typedef {import('../agents.js').Posterum} Posterum */

/** @type {{ value: Posterum[] }} */
const store = persisted('avagenc.postera', /** @type {Posterum[]} */ (SEED_POSTERA));

export const posteraStore = {
	get list() {
		return store.value;
	},
	/** @param {number} id */
	cancel(id) {
		store.value = store.value.filter((x) => x.id !== id);
	}
};
