<script>
	import { portal } from '$lib/portal.js';
	import Icon from './Icon.svelte';
	import GoogleG from './GoogleG.svelte';

	/** @type {{ data: { icon: string, q: string, sub: string, btn: string, run: () => void, account?: string }, onCancel: () => void }} */
	let { data, onCancel } = $props();

	$effect(() => {
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') onCancel();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="confirm-scrim" use:portal onclick={onCancel} role="presentation">
	<div class="confirm-sheet" onclick={(e) => e.stopPropagation()} role="presentation">
		<div class="ic"><Icon name={data.icon} size={20} /></div>
		<div class="q">{data.q}</div>
		<div class="sub">{data.sub}</div>
		{#if data.account}
			<div class="confirm-account">
				<GoogleG size={16} />
				<span>Keluar sebagai <strong>{data.account}</strong></span>
			</div>
		{/if}
		<div class="confirm-actions">
			<button class="btn-soft" onclick={onCancel}>Batal</button>
			<button class="btn-danger" onclick={data.run}>{data.btn}</button>
		</div>
	</div>
</div>
