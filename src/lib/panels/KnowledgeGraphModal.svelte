<script>
	/* Modal fokus Knowledge Graph: bukan halaman baru — scrim + kartu besar
	   (idiom TopupModal) yang cukup lega untuk mengeksplorasi graf. Data
	   ditarik ulang tiap modal dibuka (mount ulang, seperti PosteraPanel);
	   selama refresh graf lama tetap tampil. */
	import { onMount } from 'svelte';
	import { portal } from '$lib/portal.js';
	import { knowledgeStore } from '$lib/stores/knowledge.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import KnowledgeGraph from '$lib/components/KnowledgeGraph.svelte';

	/** @type {{ onClose: () => void }} */
	let { onClose } = $props();

	onMount(() => {
		knowledgeStore.load();
	});

	const empty = $derived(knowledgeStore.loaded && knowledgeStore.nodes.length === 0);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="topup-scrim" use:portal onclick={onClose} role="presentation">
	<div class="kg-modal" onclick={(e) => e.stopPropagation()} role="presentation">
		<div class="kg-head">
			<div class="kg-head-title">
				<h3>Knowledge Graph</h3>
				<span class="kg-head-sub">
					{#if knowledgeStore.loaded && !empty}
						{knowledgeStore.nodes.length} entitas · {knowledgeStore.edges.length} relasi
						{#if knowledgeStore.lastFetched}· Diperbarui {knowledgeStore.lastFetched}{/if}
					{:else}
						Memori semantik yang Ava pelajari dari percakapanmu
					{/if}
				</span>
			</div>
			<div class="kg-head-actions">
				<button
					class="icon-btn"
					onclick={() => knowledgeStore.load()}
					disabled={knowledgeStore.loading}
					aria-label="refresh knowledge graph"
				>
					<span class={knowledgeStore.loading ? 'postera-spin' : ''} style="display:flex">
						<Icon name="retry" size={16} stroke={1.8} />
					</span>
				</button>
				<button class="icon-btn" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
			</div>
		</div>

		<div class="kg-body">
			{#if !knowledgeStore.loaded}
				{#if knowledgeStore.error}
					<div class="kg-state">
						<div class="kg-state-icon"><Icon name="alert" size={18} /></div>
						<p>Gagal memuat knowledge graph.</p>
						<button class="kg-retry-btn" onclick={() => knowledgeStore.load()}>Coba lagi</button>
					</div>
				{:else}
					<div class="kg-state">
						<p class="kg-state-soft">Memuat knowledge graph…</p>
					</div>
				{/if}
			{:else if empty}
				<div class="kg-state">
					<div class="kg-state-icon"><Icon name="graph" size={18} /></div>
					<p>Belum ada knowledge.</p>
					<p class="kg-state-soft">
						Mulai ngobrol dengan Ava — entitas dan relasi yang ia pelajari akan tumbuh di sini.
					</p>
				</div>
			{:else}
				<KnowledgeGraph nodes={knowledgeStore.nodes} edges={knowledgeStore.edges} />
			{/if}
		</div>
	</div>
</div>
