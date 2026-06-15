<script>
	import { AGENTS } from '$lib/agents.js';

	// Splits text on @mentions and applies search-query highlight in one pass.
	/** @type {{ text?: string, query?: string, onMention?: (agentId: string, el: Element) => void }} */
	let { text, query = '', onMention } = $props();

	/** Maps a mention token ("@ava") to a known agent id, or null. @param {string} value */
	function agentId(value) {
		const id = value.slice(1).toLowerCase();
		return /** @type {Record<string, any>} */ (AGENTS)[id] ? id : null;
	}

	/** @typedef {{ type: 'mention'|'text'|'hit', value: string }} Token */
	/** @param {string} str @param {string} q @returns {Token[]} */
	function tokenize(str, q) {
		/** @type {Token[]} */
		const tokens = [];
		const parts = String(str).split(/(@\w+)/g);
		for (const part of parts) {
			if (/^@\w+$/.test(part)) {
				tokens.push({ type: 'mention', value: part });
			} else {
				pushHighlighted(tokens, part, q);
			}
		}
		return tokens;
	}

	/** @param {Token[]} tokens @param {string} str @param {string} q */
	function pushHighlighted(tokens, str, q) {
		if (!q) {
			if (str) tokens.push({ type: 'text', value: str });
			return;
		}
		const low = str.toLowerCase();
		const needle = q.toLowerCase();
		let i = 0;
		while (i < str.length) {
			const found = low.indexOf(needle, i);
			if (found === -1) {
				tokens.push({ type: 'text', value: str.slice(i) });
				break;
			}
			if (found > i) tokens.push({ type: 'text', value: str.slice(i, found) });
			tokens.push({ type: 'hit', value: str.slice(found, found + needle.length) });
			i = found + needle.length;
		}
	}

	const tokens = $derived(tokenize(text ?? '', query));
</script>

{#each tokens as t, i (i)}{#if t.type === 'mention'}{@const id = agentId(t.value)}{#if id && onMention}<span
			class="mention mention-btn"
			role="button"
			tabindex="0"
			onclick={(e) => {
				e.stopPropagation();
				onMention(id, /** @type {Element} */ (e.currentTarget));
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onMention(id, /** @type {Element} */ (e.currentTarget));
				}
			}}>{t.value}</span
		>{:else}<span class="mention">{t.value}</span>{/if}{:else if t.type === 'hit'}<mark
			class="hit">{t.value}</mark
		>{:else}{t.value}{/if}{/each}
