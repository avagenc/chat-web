<script>
	import { AGENTS, AGENT_LIST, SOON_AGENTS } from '$lib/agents.js';
	import { closeActivePopup } from '$lib/popup.js';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import AgentInfoFloat from '$lib/components/AgentInfoFloat.svelte';
	import ActionConfirm from '$lib/components/ActionConfirm.svelte';

	/** @type {{ onSearch: () => void, onClearChat: () => void, onClearKnowledge: () => void }} */
	let { onSearch, onClearChat, onClearKnowledge } = $props();

	/** @type {string|null} */
	let openAgent = $state(null);
	/** @type {string|null} */
	let openSoon = $state(null);
	const soonAgent = $derived(SOON_AGENTS.find((a) => a.id === openSoon) ?? null);
	/** @type {'chat'|'knowledge'|null} */
	let confirm = $state(null);
	/** @type {{ id: string, el: Element }|null} */
	let agentFloat = $state(null);

	const agentCount = Object.keys(AGENTS).length;

	const meta = {
		chat: {
			icon: 'trash',
			q: 'Hapus riwayat chat?',
			sub: 'Semua pesan di obrolan ini akan dihapus. Knowledge yang Ava pelajari tetap aman.',
			btn: 'Hapus riwayat',
			run: () => onClearChat()
		},
		knowledge: {
			icon: 'brain',
			q: 'Hapus semua knowledge?',
			sub: 'Ava dan tim akan lupa preferensi dan kebiasaan yang sudah dipelajari soal kamu. Isi obrolan tidak ikut terhapus. Tindakan ini tidak bisa dibatalkan.',
			btn: 'Hapus knowledge',
			run: () => onClearKnowledge()
		}
	};

	/** @param {Event} e @param {string} id */
	function openAgentFloat(e, id) {
		e.stopPropagation();
		closeActivePopup();
		agentFloat = { id, el: /** @type {Element} */ (e.currentTarget) };
	}
</script>

<div class="center info-page-inner" style="position:relative">
	<div class="chat-id info-id">
		<div class="chat-id-logo"><Logo size={60} variant="ink" /></div>
		<div class="chat-id-name">Avagenc</div>
		<p class="chat-id-desc">Tim multi-agent yang bekerja bareng untuk melayani kamu.</p>
	</div>

	<div class="set-group">
		<div class="group-label">{agentCount} agen</div>
		<div class="agent-scroller">
			{#each AGENT_LIST as a (a.id)}
				<button
					class={'agent-chip' + (openAgent === a.id ? ' on' : '')}
					style:--agent={a.varc}
					onclick={() => (openAgent = openAgent === a.id ? null : a.id)}
				>
					<span
						class="agent-av"
						role="button"
						tabindex="0"
						onclick={(e) => openAgentFloat(e, a.id)}
						onkeydown={(e) => e.key === 'Enter' && openAgentFloat(e, a.id)}
						><Logo size={22} variant="cream" /></span
					>
					<span class="agent-nm">{a.name}</span>
				</button>
			{/each}
		</div>
		{#if openAgent}
			<div class="agent-detail" style:--agent={AGENTS[openAgent].varc}>
				<div class="agent-detail-head">
					<span class="agent-av lg"><Logo size={18} variant="cream" /></span>
					<div>
						<div class="agent-detail-name">{AGENTS[openAgent].name}</div>
						<div class="agent-detail-role">{AGENTS[openAgent].role}</div>
					</div>
				</div>
				<p class="agent-detail-desc">{AGENTS[openAgent].desc}</p>
			</div>
		{/if}
	</div>

	<div class="set-group">
		<div class="group-label">Segera hadir</div>
		<div class="agent-scroller">
			{#each SOON_AGENTS as a (a.id)}
				<button
					class={'agent-chip soon' + (openSoon === a.id ? ' on' : '')}
					style:--agent={a.varc}
					onclick={() => (openSoon = openSoon === a.id ? null : a.id)}
				>
					<span class="agent-av"><Logo size={22} variant="cream" /></span>
					<span class="agent-nm">{a.name}</span>
					<span class="soon-badge">Soon</span>
				</button>
			{/each}
		</div>
		{#if soonAgent}
			<div class="agent-detail" style:--agent={soonAgent.varc}>
				<div class="agent-detail-head">
					<span class="agent-av lg"><Logo size={18} variant="cream" /></span>
					<div>
						<div class="agent-detail-name">{soonAgent.name}</div>
						<div class="agent-detail-role">{soonAgent.role}</div>
					</div>
				</div>
				<p class="agent-detail-desc">{soonAgent.desc}</p>
				<span class="agent-detail-soon">
					<Icon name="clock" size={13} /> Segera hadir — lagi disiapkan
				</span>
			</div>
		{/if}
	</div>

	<div class="set-group">
		<div class="set-list">
			<button class="set-row" onclick={onSearch}>
				<span class="ico"><Icon name="search" size={18} /></span>
				<span class="txt">
					<span class="t">Cari di chat</span>
					<span class="d">Temukan pesan, nama, atau kata</span>
				</span>
				<span class="chev"><Icon name="chev" size={16} /></span>
			</button>
		</div>
	</div>

	<div class="set-group">
		<div class="group-label">Kelola</div>
		<div class="set-list">
			<button class="set-row danger" onclick={() => (confirm = 'chat')}>
				<span class="ico"><Icon name="trash" size={18} /></span>
				<span class="txt">
					<span class="t">Hapus riwayat chat</span>
					<span class="d">Kosongkan semua pesan di obrolan ini</span>
				</span>
				<span class="chev"><Icon name="chev" size={16} /></span>
			</button>
			<button class="set-row danger" onclick={() => (confirm = 'knowledge')}>
				<span class="ico"><Icon name="brain" size={18} /></span>
				<span class="txt">
					<span class="t">Hapus knowledge</span>
					<span class="d">Hal yang Ava ingat soal kamu — terpisah dari isi chat</span>
				</span>
				<span class="chev"><Icon name="chev" size={16} /></span>
			</button>
		</div>
	</div>

	{#if agentFloat}
		<AgentInfoFloat
			agentId={agentFloat.id}
			anchor={agentFloat.el}
			onClose={() => (agentFloat = null)}
		/>
	{/if}
	{#if confirm}
		<ActionConfirm data={meta[confirm]} onCancel={() => (confirm = null)} />
	{/if}
</div>
