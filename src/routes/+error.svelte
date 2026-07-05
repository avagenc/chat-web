<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	// This renders for any unmatched route (404) as well as thrown errors. The
	// copy stays in Bahasa Indonesia and matches the paper/serif/terracotta look
	// of the rest of the app; no prototype/simulation language here either.
	const notFound = $derived(page.status === 404);
	const heading = $derived(notFound ? 'Halaman tak ditemukan' : 'Ada yang tidak beres');
	const blurb = $derived(
		notFound
			? 'Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada.'
			: 'Terjadi kesalahan tak terduga saat memuat halaman ini. Coba muat ulang, atau kembali ke beranda.'
	);
</script>

<svelte:head>
	<title>{page.status} — Avagenc</title>
	<meta name="robots" content="noindex" />
	<link rel="icon" href="/avagenc-accent.svg" />
</svelte:head>

<div class="nf">
	<main class="nf-inner">
		<img class="nf-glyph" src="/avagenc-accent.svg" alt="" aria-hidden="true" />
		<div class="nf-code">{page.status}</div>
		<h1 class="nf-title">{heading}</h1>
		<p class="nf-blurb">{blurb}</p>
		<a class="nf-btn" href={resolve('/')}>ke halaman utama</a>
	</main>
</div>

<style>
	.nf {
		position: fixed;
		inset: 0;
		background: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		overflow: hidden;
	}
	/* paper grain, same recipe as the rest of the app */
	.nf::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.5;
		background-image: radial-gradient(rgba(44, 35, 28, 0.022) 1px, transparent 1px);
		background-size: 4px 4px;
	}

	.nf-inner {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		max-width: 420px;
		animation: rise 0.42s var(--ease) both;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.nf-glyph {
		width: 40px;
		height: 40px;
		opacity: 0.9;
		margin-bottom: 22px;
	}
	.nf-code {
		font-family: var(--sans);
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: 0.14em;
		color: var(--accent-deep);
		font-variant-numeric: tabular-nums;
		margin-bottom: 10px;
	}
	.nf-title {
		font-family: var(--serif);
		font-weight: 400;
		font-size: clamp(27px, 6vw, 34px);
		line-height: 1.15;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0;
		text-wrap: balance;
	}
	.nf-blurb {
		font-family: var(--serif);
		font-size: 17px;
		line-height: 1.62;
		color: var(--ink-muted);
		margin: 14px 0 0;
		text-wrap: pretty;
	}

	.nf-btn {
		margin-top: 30px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--sans);
		font-size: 14.5px;
		font-weight: 500;
		color: var(--surface);
		background: var(--accent);
		border: 1px solid var(--accent-deep);
		border-radius: 999px;
		padding: 11px 22px;
		text-decoration: none;
		transition:
			background 0.16s var(--ease),
			transform 0.16s var(--ease);
	}
	.nf-btn:hover {
		background: var(--accent-deep);
	}
	.nf-btn:active {
		transform: translateY(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.nf-inner {
			animation: none;
		}
	}
</style>
