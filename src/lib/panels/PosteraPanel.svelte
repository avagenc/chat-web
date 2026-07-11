<script>
	import { onMount } from 'svelte';
	import { posteraStore } from '$lib/stores/postera.svelte.js';
	import Icon from '$lib/components/Icon.svelte';
	import ActionConfirm from '$lib/components/ActionConfirm.svelte';

	/** @typedef {import('$lib/agents.js').Posterum} Posterum */
	/** @type {{ postera: Posterum[], onCancel: (id: string) => void, onClose: () => void }} */
	let { postera, onCancel, onClose } = $props();

	/** @type {string|null} */
	let openId = $state(null);
	/** @type {Posterum|null} */
	let confirmItem = $state(null);
	let refreshing = $state(false);

	async function handleRefresh() {
		if (refreshing) return;
		refreshing = true;
		try {
			await posteraStore.load();
		} catch {
			/* refresh gagal: biarkan list lama; jam "Diperbarui" tidak maju */
		} finally {
			refreshing = false;
		}
	}

	// Panel di-mount tiap kali dibuka (dirender kondisional di +page.svelte),
	// jadi tarik ulang postera tepat saat panel terbuka.
	onMount(handleRefresh);

	const cancelMeta = $derived.by(() => {
		const item = confirmItem;
		if (!item) return null;
		return {
			icon: 'hourglass',
			q: 'Batalkan posterum ini?',
			sub: 'Ava tidak akan menerima pesan ini di masa depan. Tindakan ini tidak bisa dibatalkan.',
			btn: 'Batalkan posterum',
			run: () => {
				onCancel(item.id);
				confirmItem = null;
			}
		};
	});
</script>

<aside class="sheet">
	<div class="sheet-head">
		<h3>Postera</h3>
		<div style="display:flex;gap:4px;align-items:center">
			<button
				class="icon-btn"
				onclick={handleRefresh}
				disabled={refreshing}
				aria-label="refresh postera"
			>
				<span class={refreshing ? 'postera-spin' : ''} style="display:flex">
					<Icon name="retry" size={16} stroke={1.8} />
				</span>
			</button>
			<button class="icon-btn" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
		</div>
	</div>
	<div class="sheet-body">
		<div class="postera-header-row">
			<p class="postera-desc">
				Postera are self wake up messages Ava has scheduled for her future self. A single postera is
				called a posterum.
			</p>
			{#if posteraStore.lastFetched}
				<span class="postera-fetched">Diperbarui {posteraStore.lastFetched}</span>
			{/if}
		</div>
		{#if postera.length === 0}
			<div class="postera-empty">
				<div class="pe-icon"><Icon name="hourglass" size={18} /></div>
				<p>Tidak ada posterum aktif saat ini.</p>
			</div>
		{:else}
			<div class="postera-list">
				{#each postera as item (item.id)}
					<div
						class={'posterum' + (openId === item.id ? ' open' : '')}
						onclick={() => (openId = openId === item.id ? null : item.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && (openId = openId === item.id ? null : item.id)}
					>
						<div class="posterum-head">
							<span class="posterum-time">
								<Icon name="clock" size={12} stroke={2} />
								{item.awaken_at}
							</span>
							<span class="posterum-preview">{item.message}</span>
							<span class="posterum-chevron">
								<Icon name="down" size={14} stroke={1.7} />
							</span>
						</div>
						{#if openId === item.id}
							<div class="posterum-body">
								<div class="posterum-msg">{item.message}</div>
								<div class="posterum-awaken">
									<Icon name="clock" size={13} stroke={1.6} />
									Bangun pada <strong>{item.awaken_at}</strong>
								</div>
								<button
									class="posterum-cancel-btn"
									onclick={(e) => {
										e.stopPropagation();
										confirmItem = item;
									}}
								>
									Batalkan posterum
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	{#if cancelMeta}
		<ActionConfirm data={cancelMeta} onCancel={() => (confirmItem = null)} />
	{/if}
</aside>
