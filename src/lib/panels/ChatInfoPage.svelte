<script>
	import { AGENT_LIST, SOON_AGENTS } from '$lib/agents.js';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ActionConfirm from '$lib/components/ActionConfirm.svelte';

	/** @type {{ onSearch: () => void, onClearChat: () => void }} */
	let { onSearch, onClearChat } = $props();

	// active agents first, then the "segera hadir" teasers — all in one row
	const allAgents = [
		...AGENT_LIST.map((a) => ({ ...a, soon: false })),
		...SOON_AGENTS.map((a) => ({ ...a, soon: true }))
	];

	/** @type {string|null} */
	let openAgent = $state(null);
	const open = $derived(allAgents.find((a) => a.id === openAgent) ?? null);
	/** @type {boolean} */
	let confirm = $state(false);

	const agentCount = AGENT_LIST.length;

	// Riwayat chat dan knowledge terikat di Zep (memori episodik & semantik lahir
	// dari thread yang sama), jadi cuma ada satu aksi reset yang menghapus keduanya
	// sekaligus — bukan dua tombol yang seakan bisa dipisah.
	const resetMeta = {
		icon: 'trash',
		q: 'Reset chat & knowledge?',
		sub: 'Semua pesan di obrolan ini dan semua yang sudah Ava pelajari soal kamu akan dihapus sekaligus. Tindakan ini tidak bisa dibatalkan.',
		btn: 'Reset semua',
		run: () => onClearChat()
	};
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
			{#each allAgents as a (a.id)}
				<button
					class={'agent-chip' + (a.soon ? ' soon' : '') + (openAgent === a.id ? ' on' : '')}
					style:--agent={a.varc}
					onclick={() => (openAgent = openAgent === a.id ? null : a.id)}
				>
					<span class="agent-av"><Logo size={22} variant="cream" /></span>
					<span class="agent-nm">{a.name}</span>
					{#if a.soon}<span class="soon-badge">Soon</span>{/if}
				</button>
			{/each}
		</div>
		{#if open}
			<div class="agent-detail" style:--agent={open.varc}>
				<div class="agent-detail-head">
					<span class="agent-av lg"><Logo size={18} variant="cream" /></span>
					<div>
						<div class="agent-detail-name">{open.name}</div>
						<div class="agent-detail-role">{open.role}</div>
					</div>
				</div>
				<p class="agent-detail-desc">{open.desc}</p>
				{#if open.soon}
					<span class="agent-detail-soon">
						<Icon name="clock" size={13} /> Segera hadir — lagi disiapin
					</span>
				{/if}
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
			<button class="set-row danger" onclick={() => (confirm = true)}>
				<span class="ico"><Icon name="trash" size={18} /></span>
				<span class="txt">
					<span class="t">Reset chat &amp; knowledge</span>
					<span class="d">Hapus semua pesan dan yang Ava pelajari soal kamu</span>
				</span>
				<span class="chev"><Icon name="chev" size={16} /></span>
			</button>
		</div>
	</div>

	{#if confirm}
		<ActionConfirm data={resetMeta} onCancel={() => (confirm = false)} />
	{/if}
</div>
