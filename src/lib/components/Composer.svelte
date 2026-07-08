<script>
	import { AGENTS, AGENT_LIST } from '$lib/agents.js';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';

	/** @typedef {import('$lib/agents.js').Agent} Agent */
	/** @type {{ busy?: boolean, onSendText: (t: string) => void }} */
	let { busy = false, onSendText } = $props();

	let text = $state('');
	/** @type {{ query: string, start: number }|null} */
	let mention = $state(null);
	let mentionIdx = $state(0);

	/** @type {HTMLTextAreaElement|null} */
	let ta = $state(null);
	/** @type {HTMLDivElement|null} */
	let mirror = $state(null);

	const canSend = $derived(!busy && text.trim().length > 0);

	const suggestions = $derived.by(() => {
		const m = mention;
		if (m === null) return [];
		return AGENT_LIST.filter(
			(a) => m.query === '' || a.id.startsWith(m.query) || a.name.toLowerCase().startsWith(m.query)
		);
	});

	// auto-grow textarea (reading `text` registers the dependency)
	$effect(() => {
		const value = text;
		if (!ta || value == null) return;
		ta.style.height = 'auto';
		ta.style.height = Math.min(ta.scrollHeight, 132) + 'px';
	});

	// mirror tokens: @mentions become marks; plain text preserved via white-space:pre-wrap
	/** @param {string} val */
	function mirrorTokens(val) {
		return val.split(/(@\w+)/g).map((part) => {
			if (/^@\w+$/.test(part)) {
				const id = part.slice(1).toLowerCase();
				return { kind: AGENTS[id] ? 'mention' : 'partial', value: part };
			}
			return { kind: 'text', value: part };
		});
	}
	const tokens = $derived(mirrorTokens(text));

	/** @param {Event & { currentTarget: HTMLTextAreaElement }} e */
	function handleChange(e) {
		const val = e.currentTarget.value;
		const cursor = e.currentTarget.selectionStart;
		text = val;
		const before = val.slice(0, cursor);
		const m = before.match(/@(\w*)$/);
		if (m) {
			mention = { query: m[1].toLowerCase(), start: cursor - m[0].length };
			mentionIdx = 0;
		} else {
			mention = null;
		}
	}

	function syncScroll() {
		if (mirror && ta) mirror.scrollTop = ta.scrollTop;
	}

	/** @param {Agent} agent */
	function pickSuggestion(agent) {
		if (!mention) return;
		const cursor = ta ? ta.selectionStart : text.length;
		const before = text.slice(0, mention.start);
		const after = text.slice(cursor);
		const pos = mention.start + agent.id.length + 2; // @ + id + space
		text = before + '@' + agent.id + ' ' + after;
		mention = null;
		mentionIdx = 0;
		ta?.focus();
		requestAnimationFrame(() => ta?.setSelectionRange(pos, pos));
	}

	function send() {
		if (!canSend) return;
		onSendText(text.trim());
		text = '';
		mention = null;
	}

	/** @param {KeyboardEvent} e */
	function onKey(e) {
		if (mention && suggestions.length > 0) {
			if (e.key === 'Tab') {
				e.preventDefault();
				pickSuggestion(suggestions[mentionIdx] || suggestions[0]);
				return;
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				mentionIdx = (mentionIdx + 1) % suggestions.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				mentionIdx = (mentionIdx - 1 + suggestions.length) % suggestions.length;
				return;
			}
			if (e.key === 'Enter') {
				e.preventDefault();
				pickSuggestion(suggestions[mentionIdx] || suggestions[0]);
				return;
			}
			if (e.key === 'Escape') {
				mention = null;
				return;
			}
		}
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (canSend) send();
		}
	}
</script>

<div class="composer-wrap">
	<div class="center composer">
		<div class="inputbar" style="position:relative">
			{#if mention && suggestions.length > 0}
				<div class="mention-popup">
					{#each suggestions as a, i (a.id)}
						<button
							class={'mention-row' + (i === mentionIdx ? ' on' : '')}
							style:--agent={a.varc}
							onmousedown={(e) => {
								e.preventDefault();
								pickSuggestion(a);
							}}
						>
							<span class="mention-av"><Logo size={15} variant="cream" /></span>
							<span class="mention-name">{a.name}</span>
							<span class="mention-role">{a.role}</span>
							{#if i === 0 && suggestions.length > 1}
								<span class="mention-tab-hint">Tab</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<div class="inputbar-mirror-wrap">
				<div bind:this={mirror} class="ta-mirror ta-mirror-under" aria-hidden="true">
					{#each tokens as t, i (i)}{#if t.kind === 'mention'}<mark class="ta-mention"
								>{t.value}</mark
							>{:else if t.kind === 'partial'}<mark class="ta-mention-partial">{t.value}</mark
							>{:else}{t.value}{/if}{/each}
				</div>
				<textarea
					bind:this={ta}
					class="composer-textarea ta-over-mirror"
					placeholder={busy ? 'Menunggu balasan agent…' : 'Ketik pesan…'}
					value={text}
					rows="1"
					disabled={busy}
					oninput={handleChange}
					onkeydown={onKey}
					onscroll={syncScroll}
				></textarea>
			</div>

			<button class="send-btn" onclick={send} disabled={!canSend} aria-label="kirim">
				<Icon name="send" size={18} />
			</button>
		</div>
	</div>
</div>
