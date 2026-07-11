<script>
	import { wallet } from '$lib/stores/wallet.svelte.js';

	/** @type {{ onOpenProfile: () => void }} */
	let { onOpenProfile } = $props();
</script>

<div class="usage-widget">
	<button class="uw-trigger" onclick={onOpenProfile} aria-label="Buka pemakaian & saldo">
		<span class="uw-rp">Rp</span>
	</button>
	<div class="uw-popup" role="tooltip">
		<div class="uw-row">
			<span class="uw-lbl">Hari ini</span>
			<span class="uw-cost">{wallet.todayCostLabel}</span>
		</div>
		<div class="uw-row">
			<span class="uw-lbl">Saldo</span>
			<strong class="uw-bal">{wallet.balanceLabel}</strong>
		</div>
		<div class="uw-hint">Klik untuk kelola &amp; isi ulang</div>
	</div>
</div>
