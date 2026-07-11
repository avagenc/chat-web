<script>
	import { onMount } from 'svelte';
	import { AGENTS } from '$lib/agents.js';
	import { api, ApiError } from '$lib/api.js';
	import { session } from '$lib/stores/session.svelte.js';
	import { wallet } from '$lib/stores/wallet.svelte.js';
	import { closeActivePopup } from '$lib/popup.js';
	import Icon from '$lib/components/Icon.svelte';
	import GoogleG from '$lib/components/GoogleG.svelte';
	import Brand from '$lib/components/Brand.svelte';
	import ActionConfirm from '$lib/components/ActionConfirm.svelte';
	import TuyaVipFloat from '$lib/components/TuyaVipFloat.svelte';
	import TopupModal from './TopupModal.svelte';

	/** @type {{ onClose: () => void, onLogout: () => void }} */
	let { onClose, onLogout } = $props();

	/** @type {'logout'|null} */
	let confirm = $state(null);
	let showTopup = $state(false);
	/** @type {{ el: Element }|null} */
	let tuyaFloat = $state(null);

	const logoutMeta = $derived({
		icon: 'exit',
		q: 'Keluar dari Avagenc?',
		sub: 'Kamu perlu masuk lagi dengan Google untuk melanjutkan obrolan.',
		btn: 'Keluar',
		run: () => onLogout(),
		account: session.profile.email
	});

	/* Satu grant OAuth Google Workspace mencakup Gmail + Kontak + Kalender
	   sekaligus (backend menyimpan satu refresh token untuk ketiganya), jadi
	   satu row dengan satu tombol Hubungkan. Tuya di-link manual oleh tim
	   (VIP onboarding) — tidak lewat OAuth publik, tapi status koneksinya tetap
	   dicek (GET /tuya/connection) supaya bisa tampil "Terhubung". */
	const integrations = [
		{
			id: 'gworkspace',
			name: 'Google Workspace',
			brands: ['gmail', 'contacts', 'calendar'],
			agent: AGENTS.rafal,
			kind: 'oauth'
		},
		{ id: 'spotify', name: 'Spotify', brands: ['spotify'], agent: AGENTS.yori, kind: 'oauth' },
		{ id: 'tuya', name: 'Tuya Smart', brands: ['tuya'], agent: AGENTS.zee, kind: 'manual' }
	];

	/** null = status belum diketahui (masih fetch / gagal fetch)
	 * @type {Record<string, boolean|null>} */
	let conn = $state({ gworkspace: null, spotify: null, tuya: null });
	/** id integrasi yang sedang diproses (minta auth-url / disconnect) @type {string|null} */
	let busyIntg = $state(null);
	/** @type {{ id: string, name: string }|null} */
	let confirmDisconnect = $state(null);
	// Spinner tombol refresh pemakaian di-drive state LOKAL (persis PosteraPanel),
	// bukan wallet.refreshing global — supaya refresh saldo di latar (tiap giliran
	// agent) tidak bikin tombol ini ikut berputar.
	let refreshing = $state(false);

	function refreshIntegrations() {
		for (const it of integrations) {
			api(`/${it.id}/connection`)
				.then((s) => (conn = { ...conn, [it.id]: !!s?.connected }))
				// endpoint gagal: OAuth → biarkan "memeriksa…"; manual (Tuya) →
				// anggap belum tersambung supaya CTA VIP tetap muncul.
				.catch(() => (conn = { ...conn, [it.id]: it.kind === 'manual' ? false : null }));
		}
	}

	// Panel di-mount tiap kali dibuka (dirender kondisional di +page.svelte),
	// jadi tarik ulang pemakaian/saldo + status integrasi TEPAT saat terbuka —
	// bukan reaktif. Persis pola PosteraPanel: refresh saat dibuka & saat diklik,
	// tidak berulang. (onMount tidak melacak dependency, jadi tidak ada loop.)
	onMount(() => {
		refreshUsage();
		refreshIntegrations();
	});

	/** Mulai flow OAuth: minta consent URL lalu pindah halaman ke provider.
	 * @param {string} id */
	async function connect(id) {
		if (busyIntg) return;
		busyIntg = id;
		try {
			const { url } = await api(`/${id}/auth-url`);
			window.location.href = url; // provider redirect balik ke /{id}/link/callback
		} catch {
			busyIntg = null;
			session.flashToast('Gagal memulai penautan. Coba lagi.');
		}
	}

	/** @param {string} id */
	async function disconnect(id) {
		busyIntg = id;
		try {
			await api(`/${id}/connection`, { method: 'DELETE' });
			conn = { ...conn, [id]: false };
			session.flashToast('Akun diputuskan');
		} catch (e) {
			if (e instanceof ApiError && e.status === 404) {
				conn = { ...conn, [id]: false }; // memang belum tersambung
			} else {
				session.flashToast('Gagal memutuskan akun. Coba lagi.');
			}
		} finally {
			busyIntg = null;
		}
	}

	const disconnectMeta = $derived.by(() => {
		const target = confirmDisconnect;
		if (!target) return null;
		return {
			icon: 'exit',
			q: `Putuskan ${target.name}?`,
			sub: 'Agent terkait tidak bisa lagi mengakses akun ini sampai kamu menghubungkannya ulang.',
			btn: 'Putuskan',
			run: () => {
				disconnect(target.id);
				confirmDisconnect = null;
			}
		};
	});

	/** @param {Event} e */
	function toggleTuya(e) {
		e.stopPropagation();
		if (tuyaFloat) {
			tuyaFloat = null;
			return;
		}
		closeActivePopup();
		tuyaFloat = { el: /** @type {Element} */ (e.currentTarget) };
	}

	async function refreshUsage() {
		if (refreshing) return;
		refreshing = true;
		try {
			await wallet.refresh();
		} catch {
			session.flashToast('Gagal memuat pemakaian. Coba lagi.');
		} finally {
			refreshing = false;
		}
	}
</script>

<aside class="sheet sheet-left">
	<div class="sheet-head">
		<h3>Profil</h3>
		<button class="icon-btn" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
	</div>

	<div class="sheet-body">
		<div class="profile">
			<div class="profile-avatar">
				{session.profile.initial}
				<span class="g-badge"><GoogleG size={13} /></span>
			</div>
			<div class="profile-name">{session.profile.name}</div>
			<div class="profile-account">
				<GoogleG size={15} />
				<span class="email">{session.profile.email}</span>
			</div>
			<div class="profile-caption">Masuk lewat Akun Google</div>
		</div>

		<div class="set-group">
			<div class="group-label">Pemakaian</div>
			<div class="usage-card">
				<div class="usage-head">
					<span>Hari ini</span>
					<span class="usage-refresh">
						{#if wallet.lastUpdated}
							<span class="usage-updated">Diperbarui {wallet.lastUpdated}</span>
						{/if}
						<button
							class="icon-btn sm"
							onclick={refreshUsage}
							disabled={refreshing}
							aria-label="perbarui pemakaian"
						>
							<span class={refreshing ? 'postera-spin' : ''} style="display:flex">
								<Icon name="retry" size={14} stroke={1.8} />
							</span>
						</button>
					</span>
				</div>
				<div class="usage-hero">
					<div class="big">{wallet.todayCostLabel}</div>
					<div class="unit">terpakai hari ini untuk {wallet.todayTokensLabel} token</div>
				</div>
				<div class="usage-foot">
					<div class="balance">
						<span class="bl">Saldo</span><strong>{wallet.balanceLabel}</strong>
					</div>
					<button class="btn-topup" onclick={() => (showTopup = true)}
						><Icon name="plus" size={15} /> Isi ulang</button
					>
				</div>
			</div>
		</div>

		<div class="set-group">
			<div class="group-label">Integrasi</div>
			<div class="group-note">Hubungkan layanan biar Ava dan tim-nya bisa bantu lebih banyak!</div>
			<div class="set-list">
				{#each integrations as it (it.id)}
					<div class="set-row static">
						<span class="brand-stack" data-count={it.brands.length}>
							{#each it.brands as b (b)}
								<Brand name={b} size={it.brands.length > 1 ? 28 : 38} />
							{/each}
						</span>
						<span class="txt">
							<span class="t">{it.name}</span>
							<span class="d intg-agent" style:--agent={it.agent.varc}>
								<span class="intg-agent-dot" aria-hidden="true"></span>
								<span class="intg-agent-name">{it.agent.name}</span>
								<span class="intg-agent-role">· {it.agent.role}</span>
							</span>
						</span>
						{#if conn[it.id] === null}
							<span class="intg-checking">memeriksa…</span>
						{:else if conn[it.id] === true && it.kind === 'manual'}
							<!-- Tuya di-link manual: status saja, tanpa tombol putus -->
							<span class="intg-on intg-readonly">
								<Icon name="check" size={13} /> Terhubung
							</span>
						{:else if conn[it.id] === true}
							<button
								class="intg-on"
								disabled={busyIntg === it.id}
								onclick={() => (confirmDisconnect = { id: it.id, name: it.name })}
							>
								<Icon name="check" size={13} /> Terhubung
							</button>
						{:else if it.kind === 'manual'}
							<button class="intg-vip" onclick={toggleTuya}>
								<span class="vip-crown">✦</span> VIP
							</button>
						{:else}
							<button
								class="intg-connect"
								disabled={busyIntg === it.id}
								onclick={() => connect(it.id)}>Hubungkan</button
							>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="sheet-foot">
		<button class="btn-logout" onclick={() => (confirm = 'logout')}>
			<Icon name="exit" size={17} /> Keluar
		</button>
	</div>

	{#if confirm}
		<ActionConfirm data={logoutMeta} onCancel={() => (confirm = null)} />
	{/if}
	{#if disconnectMeta}
		<ActionConfirm data={disconnectMeta} onCancel={() => (confirmDisconnect = null)} />
	{/if}
	{#if showTopup}
		<TopupModal onClose={() => (showTopup = false)} />
	{/if}
	{#if tuyaFloat}
		<TuyaVipFloat anchor={tuyaFloat.el} onClose={() => (tuyaFloat = null)} />
	{/if}
</aside>
