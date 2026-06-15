/* Conversation state: message list (persisted), the live "thinking"
   indicator, and the send/retry/orchestrate flow. Replies are local
   simulation — runPlan/planReply is the seam to swap for a real backend. */
import { persisted } from '../persisted.svelte.js';
import { AGENTS, SEED, nextId, nowTime, pick } from '../agents.js';
import { planReply, sleep, IMAGE_REPLIES } from '../orchestrator.js';

/** @typedef {import('../agents.js').Message} Message */

/** @type {{ value: Message[] }} */
const store = persisted('avagenc.messages', /** @type {Message[]} */ (SEED));

// one-time migration: voice notes are no longer supported. Any legacy voice
// message left in localStorage would render as an empty bubble, so replace it
// with the equivalent text request.
{
	let changed = false;
	const migrated = store.value.map((m) => {
		const type = /** @type {{ type: string }} */ (m).type;
		if (type !== 'text' && type !== 'image') {
			changed = true;
			return { id: m.id, from: m.from, type: 'text', text: 'Tolong siapin kopi', time: m.time };
		}
		return m;
	});
	if (changed) store.value = /** @type {Message[]} */ (migrated);
}

// one-time migration: agents get refactored over time (e.g. "niko" was removed).
// Messages from an agent that no longer exists can't resolve a name/color, so
// drop them rather than crash the render.
{
	const cleaned = store.value.filter((m) => m.from === 'human' || m.from in AGENTS);
	if (cleaned.length !== store.value.length) store.value = cleaned;
}

/** @type {{ agent: string } | null} */
let thinking = $state(null);

// reassign-style updates (mirror the React setMessages calls) so reactivity fires
/** @param {(m: Message[]) => Message[]} updater */
function setMessages(updater) {
	store.value = updater(store.value);
}

/** @param {{ from: string, text: string }[]} plan */
async function runPlan(plan) {
	for (const turn of plan) {
		thinking = { agent: turn.from };
		await sleep(850 + Math.random() * 700);
		thinking = null;
		setMessages((m) => [
			...m,
			{ id: nextId(), from: turn.from, type: 'text', text: turn.text, time: nowTime() }
		]);
		await sleep(420);
	}
}

export const conversation = {
	get messages() {
		return store.value;
	},
	get thinking() {
		return thinking;
	},
	get empty() {
		return store.value.length === 0 && !thinking;
	},

	/** @param {string} text */
	async sendText(text) {
		const id = nextId();
		const willFail = Math.random() < 0.16;
		setMessages((m) => [
			...m,
			{ id, from: 'human', type: 'text', text, time: nowTime(), status: 'sending' }
		]);
		await sleep(620);
		if (willFail) {
			setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'error' } : x)));
			return;
		}
		setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: undefined } : x)));
		runPlan(planReply(text));
	},

	/** @param {number} id */
	async retry(id) {
		setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: 'sending' } : x)));
		await sleep(700);
		let text = '';
		setMessages((m) =>
			m.map((x) => {
				if (x.id === id) {
					text = x.text ?? '';
					return { ...x, status: undefined };
				}
				return x;
			})
		);
		runPlan(planReply(text));
	},

	/** @param {string} src @param {string} caption */
	sendImage(src, caption) {
		setMessages((m) => [
			...m,
			{ id: nextId(), from: 'human', type: 'image', src, caption, time: nowTime() }
		]);
		runPlan([{ from: 'ava', text: pick(IMAGE_REPLIES) }]);
	},

	clear() {
		store.value = [];
		thinking = null;
	}
};
