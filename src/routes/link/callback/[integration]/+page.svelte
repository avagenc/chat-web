<script>
	/* Halaman callback OAuth per-integrasi. Provider (Google, Spotify) me-redirect
	   ke `/link/callback/{integration}` sesuai redirect URI yang di-mint backend
	   dari WEB_APP_URL. Integrasi diambil dari route param — FE tidak mem-parse
	   `state` (token HMAC milik backend, tetap opaque): `code`+`state` diteruskan
	   verbatim ke POST /{integration}/connection. URL tiap integrasi harus
	   terdaftar verbatim sebagai authorized redirect URI di provider terkait. */
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api, ApiError } from '$lib/api.js';
	import { session } from '$lib/stores/session.svelte.js';
	import Logo from '$lib/components/Logo.svelte';

	/** @type {Record<string, string>} */
	const INTEGRATION_NAMES = { gworkspace: 'Google Workspace', spotify: 'Spotify' };

	/** @type {'working'|'done'|'failed'} */
	let status = $state('working');
	let message = $state('Menyelesaikan penautan…');

	let started = false;
	$effect(() => {
		if (!session.ready || started) return;
		started = true;
		run();
	});

	async function run() {
		const integration = page.params.integration ?? '';
		const name = INTEGRATION_NAMES[integration];
		const params = page.url.searchParams;
		const code = params.get('code');
		const state = params.get('state');

		if (!name) {
			status = 'failed';
			message = 'Integrasi tidak dikenal. Ulangi penautan dari panel Profil.';
			return;
		}
		if (params.get('error')) {
			// user menekan cancel di consent screen — tidak perlu memanggil API
			status = 'failed';
			message = `Penautan ${name} dibatalkan. Kamu bisa mengulanginya dari panel Profil.`;
			return;
		}
		if (!code || !state) {
			status = 'failed';
			message = 'Link callback tidak valid. Ulangi penautan dari panel Profil.';
			return;
		}
		if (!session.authed) {
			status = 'failed';
			message = 'Sesi kamu berakhir. Masuk lagi, lalu ulangi penautan dari panel Profil.';
			return;
		}

		try {
			await api(`/${integration}/connection`, { method: 'POST', body: { code, state } });
			status = 'done';
			message = `${name} terhubung.`;
			session.flashToast(`${name} terhubung`);
			goto(resolve('/'));
		} catch (e) {
			status = 'failed';
			if (e instanceof ApiError && e.status === 400) {
				message = e.detail.includes('state')
					? 'Sesi penautan kedaluwarsa. Ulangi dari panel Profil (link consent hanya berlaku 15 menit).'
					: 'Provider tidak memberikan semua izin yang diminta. Ulangi penautan dan biarkan semua izin tercentang.';
			} else {
				message = 'Gagal menyelesaikan penautan. Coba lagi dari panel Profil.';
			}
		}
	}
</script>

<svelte:head>
	<title>Menautkan akun · Avagenc Chat</title>
</svelte:head>

<div class="app">
	<div class="link-callback">
		<div class="lc-card">
			<Logo size={28} variant={status === 'failed' ? 'ink' : 'accent'} />
			<h1>
				{#if status === 'working'}Menautkan akun…{:else if status === 'done'}Berhasil terhubung{:else}Penautan
					gagal{/if}
			</h1>
			<p>{message}</p>
			{#if status !== 'working'}
				<a class="lc-back" href={resolve('/')}>Kembali ke chat</a>
			{/if}
		</div>
	</div>
</div>

<style>
	.link-callback {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 24px;
	}
	.lc-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		max-width: 380px;
		animation: rise 0.42s var(--ease) both;
	}
	.lc-card h1 {
		font-family: var(--serif);
		font-size: 24px;
		font-weight: 500;
		color: var(--ink);
		margin-top: 6px;
	}
	.lc-card p {
		font-family: var(--sans);
		font-size: 13.5px;
		line-height: 1.6;
		color: var(--ink-muted);
		text-wrap: pretty;
	}
	.lc-back {
		margin-top: 8px;
		font-family: var(--sans);
		font-size: 13px;
		font-weight: 600;
		color: var(--accent-deep);
		border: 1px solid var(--accent-tint-strong);
		border-radius: 999px;
		padding: 8px 16px;
		transition: background 0.15s var(--ease);
	}
	.lc-back:hover {
		background: var(--accent-tint);
	}
</style>
