<script>
	// Splits text on @mentions and applies search-query highlight in one pass.
	/** @type {{ text?: string, query?: string }} */
	let { text, query = '' } = $props();

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

{#each tokens as t, i (i)}{#if t.type === 'mention'}<span class="mention">{t.value}</span
		>{:else if t.type === 'hit'}<mark class="hit">{t.value}</mark>{:else}{t.value}{/if}{/each}
