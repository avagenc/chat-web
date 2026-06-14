<script>
	import { resolve } from '$app/paths';
	import Logo from './Logo.svelte';
	import GoogleG from './GoogleG.svelte';

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
			<div class="login-hook">
				<h1>Ava dan tim multi agentnya siap melayani mu,</h1>
				<h1 class="hook-accent">
					{tw.slice(0, shown)}<span class="tw-cursor" aria-hidden="true">|</span>
				</h1>
			</div>
			<div class="login-cta">
				<button type="button" class="btn-google" onclick={onLogin}>
					<GoogleG size={18} />
					Lanjutkan dengan Google
				</button>
				<div class="login-legal">
					Dengan masuk, kamu setuju dengan <a href={resolve('/')}>Ketentuan</a> dan
					<a href={resolve('/')}>Kebijakan Privasi</a> Avagenc.
				</div>
				<p class="login-notice">
					*Website ini masih murni UI/UX dengan data placeholder dikarenakan integrasi ke backend
					masih dalam tahap pengembangan.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
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
