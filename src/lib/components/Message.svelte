<script>
	import { AGENTS } from '$lib/agents.js';
	import { closeActivePopup } from '$lib/popup.js';
	import MentionText from './MentionText.svelte';
	import ImageMsg from './ImageMsg.svelte';
	import Icon from './Icon.svelte';
	import AgentInfoFloat from './AgentInfoFloat.svelte';
	import BubbleChatInfo from './BubbleChatInfo.svelte';

	/** @typedef {import('$lib/agents.js').Message} Message */
	/** @type {{ msg: Message, grouped?: boolean, onOpenImage: (src: string) => void, onRetry: (id: string) => void, query?: string, activeMatch?: boolean }} */
	let { msg, grouped = false, onOpenImage, onRetry, query = '', activeMatch = false } = $props();

	const isHuman = $derived(msg.from === 'human');
	const a = $derived(AGENTS[msg.from]);
	const tiny = $derived(msg.type === 'text' && /^@\w+[.!]?$/.test((msg.text || '').trim()));

	/** @type {{ el: Element }|null} */
	let chatInfo = $state(null);
	/** @type {{ id: string, el: Element }|null} */
	let agentPopup = $state(null);

	/** @param {Event} e */
	function toggleMenu(e) {
		e.stopPropagation();
		if (chatInfo) {
			chatInfo = null;
			return;
		}
		closeActivePopup();
		chatInfo = { el: /** @type {Element} */ (e.currentTarget) };
	}

	/** @param {Event} e */
	function handleAgentClick(e) {
		e.stopPropagation();
		if (agentPopup) {
			agentPopup = null;
			return;
		}
		closeActivePopup();
		agentPopup = { id: msg.from, el: /** @type {Element} */ (e.currentTarget) };
	}

	/** Opens the agent info float for a @mention tag clicked inside a bubble.
	 * @param {string} id @param {Element} el */
	function handleMentionClick(id, el) {
		if (agentPopup && agentPopup.id === id && agentPopup.el === el) {
			agentPopup = null;
			return;
		}
		closeActivePopup();
		agentPopup = { id, el };
	}
</script>

<div
	class={'row ' +
		(isHuman ? 'human' : 'agent') +
		(grouped ? ' grouped' : '') +
		(activeMatch ? ' active-match' : '')}
	data-mid={msg.id}
	style:--agent={a ? a.varc : null}
>
	{#if !isHuman && a}
		<div class="byline">
			<span
				class="name name-btn"
				role="button"
				tabindex="0"
				onclick={handleAgentClick}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleAgentClick(e);
					}
				}}>{a.name}</span
			>
			<span class="role">· {a.role}</span>
		</div>
	{/if}

	<div class={'bubble-wrap' + (chatInfo ? ' menu-open' : '')}>
		{#if msg.type === 'image'}
			<ImageMsg {msg} onOpen={onOpenImage} {query} />
		{:else}
			<div
				class={'bubble tap' + (tiny ? ' tiny' : '')}
				onclick={toggleMenu}
				role="button"
				aria-haspopup="true"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && toggleMenu(e)}
			>
				<MentionText text={msg.text} {query} onMention={handleMentionClick} />
			</div>
		{/if}
	</div>

	{#if chatInfo}
		<BubbleChatInfo {msg} anchor={chatInfo.el} {isHuman} onClose={() => (chatInfo = null)} />
	{/if}

	{#if agentPopup}
		<AgentInfoFloat
			agentId={agentPopup.id}
			anchor={agentPopup.el}
			onClose={() => (agentPopup = null)}
		/>
	{/if}

	{#if msg.status === 'sending'}
		<div class="msg-meta">Mengirim…</div>
	{:else if msg.status === 'error'}
		<div class="msg-meta error">
			<Icon name="alert" size={14} />
			<span
				>{msg.errorNote === 'saldo'
					? 'Saldo tidak cukup — isi ulang dulu ya.'
					: 'Gagal terkirim.'}</span
			>
			<button class="retry-btn" onclick={() => onRetry(msg.id)}>
				<Icon name="retry" size={13} /> Coba lagi
			</button>
		</div>
	{:else}
		<div class="stamp">{msg.time}</div>
	{/if}
</div>
