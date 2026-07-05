<script>
	import { resolve } from '$app/paths';
	import Logo from './Logo.svelte';
	import GoogleG from './GoogleG.svelte';
	import LoginChatPreview from './LoginChatPreview.svelte';

	/** @type {{ onLogin: () => void }} */
	let { onLogin } = $props();

	// typewriter for the accent line
	const tw = 'tanpa biaya langganan.';
	let shown = $state(0);

	$effect(() => {
		const charMs = Math.max(28, Math.round(950 / tw.length));
		/** @type {ReturnType<typeof setTimeout>} */
		let timer;
		/** @param {number} i */
		function typeNext(i) {
			shown = i;
			timer = setTimeout(() => typeNext(i < tw.length ? i + 1 : 0), i < tw.length ? charMs : 10000);
		}
		typeNext(0);
		return () => clearTimeout(timer);
	});
</script>

<div class="app">
	<div class="login-v2">
		<div class="login-brand">
			<Logo size={24} variant="ink" />
			<span class="login-brand-name">Avagenc</span>
		</div>
		<div class="login-center">
			<div class="login-left">
				<div class="login-hook">
					<h1>Ava dan tim multi agentnya siap melayani mu,</h1>
					<h1 class="hook-accent">
						{tw.slice(0, shown)}<span class="tw-cursor" aria-hidden="true">|</span>
					</h1>
				</div>
				<div class="login-cta">
					<div class="login-card">
						<div class="login-announce" aria-hidden="true">
							<span class="login-badge-tag">Baru</span>
							<span class="login-badge-text"
								><span class="login-badge-name">Rafal:</span> Siap mengurus Gmail, kontak, &amp; kalendermu.</span
							>
						</div>
						<button type="button" class="btn-google" onclick={onLogin}>
							<GoogleG size={18} />
							Lanjutkan dengan Google
						</button>
					</div>
					<div class="login-legal">
						Dengan masuk, kamu setuju dengan <a href={resolve('/legal')}>Ketentuan</a> dan
						<a href={resolve('/legal')}>Kebijakan Privasi</a> Avagenc.
					</div>
					<p class="login-notice">
						*Mode demo. Pembayaran isi ulang saldo diproses melalui Midtrans.
					</p>
				</div>
			</div>
			<LoginChatPreview />
		</div>
	</div>
</div>

<style>
	/* Pengumuman fitur baru dibungkus jadi satu kartu bersama tombol Google:
	   strip pengumuman di atas (dipisah hairline), tombol menyatu di bawah —
	   satu border luar, tanpa kesan dua tombol bertumpuk. */
	.login-card {
		width: 100%;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		/* Sengaja menyatu dengan bg halaman (--surface); border membulatlah
		   yang mengindikasikan area interaktif. */
		background: var(--surface);
		overflow: hidden;
		animation: rise 0.5s var(--ease) 0.16s both;
	}
	.login-announce {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--line);
		text-align: left;
	}
	/* Tombol menyatu di dalam kartu: border & radius sendiri dilepas;
	   bg ikut base (--surface), sama dengan kartu & halaman. */
	.login-card :global(.btn-google) {
		border: 0;
		border-radius: 0;
		margin: 0;
	}
	.login-card :global(.btn-google:hover) {
		background: var(--surface-2);
	}
	.login-badge-tag {
		flex: none;
		font-family: var(--sans);
		font-size: 9.5px;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--accent-deep);
		background: var(--accent-tint);
		border-radius: 999px;
		padding: 2px 8px;
	}
	.login-badge-text {
		font-family: var(--sans);
		font-size: 11px;
		line-height: 1.3;
		color: var(--ink-soft);
		text-wrap: pretty;
	}
	.login-badge-name {
		font-weight: 600;
		color: var(--accent-deep);
	}

	.login-notice {
		font-family: var(--sans);
		font-size: 11px;
		line-height: 1.5;
		color: var(--ink-faint);
		text-align: center;
		max-width: 320px;
		margin: 4px 0 0;
		text-wrap: pretty;
	}
</style>
