<script>
	import { portal } from '$lib/portal.js';
	import Icon from '$lib/components/Icon.svelte';
	import MidtransInfoModal from '$lib/components/MidtransInfoModal.svelte';

	/** @type {{ onClose: () => void }} */
	let { onClose } = $props();

	const TOPUP_PRESETS = [50000, 100000, 200000, 500000];
	/** @param {number} n */
	const fmtRp = (n) => 'Rp ' + n.toLocaleString('id-ID');

	/** @type {number|null} */
	let preset = $state(null);
	let custom = $state('');
	let showMidtransInfo = $state(false);

	const rawCustom = $derived(parseInt(custom.replace(/\D/g, '') || '0'));
	const amount = $derived(preset !== null ? preset : rawCustom);
	const canPay = $derived(amount >= 10000);

	/** @param {Event & { currentTarget: HTMLInputElement }} e */
	function handleCustom(e) {
		const digits = e.currentTarget.value.replace(/\D/g, '');
		custom = digits ? parseInt(digits).toLocaleString('id-ID') : '';
		preset = null;
	}
</script>

<div class="topup-scrim" use:portal onclick={onClose} role="presentation">
	<div class="topup-modal" onclick={(e) => e.stopPropagation()} role="presentation">
		<div class="topup-head">
			<h3>Isi Ulang Saldo</h3>
			<button class="icon-btn" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
		</div>

		<div class="topup-body">
			<div class="topup-balance">
				<span class="tb-label">Saldo saat ini</span>
				<span class="tb-val">Rp 148.500</span>
				<span class="tb-tag">tersedia</span>
			</div>

			<div class="topup-presets">
				{#each TOPUP_PRESETS as p (p)}
					<button
						class={'tp-chip' + (preset === p ? ' active' : '')}
						onclick={() => {
							preset = p;
							custom = '';
						}}>{fmtRp(p)}</button
					>
				{/each}
			</div>

			<div class="topup-custom-wrap">
				<span class="tc-prefix">Rp</span>
				<input
					class="tc-input"
					placeholder="Nominal lain…"
					value={custom}
					oninput={handleCustom}
					inputmode="numeric"
				/>
			</div>

			{#if canPay}
				<div class="topup-summary">
					Kamu akan menambahkan <strong>{fmtRp(amount)}</strong> ke saldo Avagenc.
				</div>
			{/if}

			<div class="topup-warnings">
				<div class="tw-item">
					<span class="tw-dot"></span><span
						>Jangan lakukan pembayaran yang sama <strong>dua kali</strong>. Setiap transaksi
						memiliki ID unik — bayar hanya sekali.</span
					>
				</div>
				<div class="tw-item">
					<span class="tw-dot"></span><span
						>Link pembayaran Midtrans berlaku <strong>24 jam</strong>. Jika kedaluwarsa, buat
						transaksi baru.</span
					>
				</div>
				<div class="tw-item">
					<span class="tw-dot"></span><span
						>Saldo masuk otomatis <strong>1–5 menit</strong> setelah pembayaran dikonfirmasi Midtrans.</span
					>
				</div>
				<div class="tw-item">
					<span class="tw-dot"></span><span>Minimal isi ulang <strong>Rp 10.000</strong>.</span>
				</div>
			</div>

			<button
				class="topup-proceed-btn"
				disabled={!canPay}
				onclick={() => (showMidtransInfo = true)}
			>
				{canPay ? `Lanjut ke Pembayaran — ${fmtRp(amount)}` : 'Pilih nominal isi ulang'}
				{#if canPay}<Icon name="chev" size={16} />{/if}
			</button>

			<p class="topup-note">
				Pembayaran diproses oleh <strong>Midtrans</strong> — platform pembayaran terpercaya di Indonesia.
			</p>
		</div>
	</div>
	{#if showMidtransInfo}
		<MidtransInfoModal onClose={() => (showMidtransInfo = false)} />
	{/if}
</div>
