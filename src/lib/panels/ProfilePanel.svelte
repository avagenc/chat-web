<script>
	import { USER } from '$lib/agents.js';
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
	/** @type {Record<string, boolean>} */
	let conn = $state({ gmail: true, calendar: true, spotify: true, tuya: false });
	let showTopup = $state(false);
	/** @type {{ el: Element }|null} */
	let tuyaFloat = $state(null);

	const logoutMeta = {
		icon: 'exit',
		q: 'Keluar dari Avagenc?',
		sub: 'Kamu perlu masuk lagi dengan Google untuk melanjutkan obrolan.',
		btn: 'Keluar',
		run: () => onLogout(),
		account: USER.email
	};

	const integrations = [
		{ id: 'gmail', brand: 'gmail', name: 'Gmail', desc: 'Baca & kirim email' },
		{ id: 'calendar', brand: 'calendar', name: 'Google Calendar', desc: 'Lihat & buat acara' },
		{ id: 'spotify', brand: 'spotify', name: 'Spotify', desc: 'Play, pause & ganti lagu' },
		{ id: 'tuya', brand: 'tuya', name: 'Tuya Smart', desc: 'Kontrol perangkat rumah' }
	];

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
</script>

<aside class="sheet sheet-left">
	<div class="sheet-head">
		<h3>Profil</h3>
		<button class="icon-btn" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
	</div>

	<div class="sheet-body">
		<div class="profile">
			<div class="profile-avatar">
				{USER.initial}
				<span class="g-badge"><GoogleG size={13} /></span>
			</div>
			<div class="profile-name">{USER.name}</div>
			<div class="profile-account">
				<GoogleG size={15} />
				<span class="email">{USER.email}</span>
			</div>
			<div class="profile-caption">Masuk lewat Akun Google</div>
		</div>

		<div class="set-group">
			<div class="group-label">Pemakaian</div>
			<div class="usage-card">
				<div class="usage-head">
					<span>Hari ini</span>
					<span class="pay-pill-wrap">
						<span class="pay-pill"><Icon name="spark" size={12} /> Pay as you go</span>
						<div class="pay-tooltip">
							Kamu bayar sesuai pemakaian — tidak ada biaya bulanan. Biaya dihitung dari jumlah
							token yang diproses oleh agen.
						</div>
					</span>
				</div>
				<div class="usage-main">
					<div class="usage-stat">
						<div class="big">52.480</div>
						<div class="unit">token dipakai</div>
					</div>
					<div class="usage-stat right">
						<div class="big">Rp 4.120</div>
						<div class="unit">estimasi biaya</div>
					</div>
				</div>
				<div class="usage-bar"><span style="width:34%"></span></div>
				<div class="usage-note">≈ 34% dari rata-rata harian kamu</div>
				<div class="usage-foot">
					<div class="balance"><span class="bl">Saldo</span><strong>Rp 148.500</strong></div>
					<button class="btn-topup" onclick={() => (showTopup = true)}
						><Icon name="plus" size={15} /> Isi ulang</button
					>
				</div>
			</div>
		</div>

		<div class="set-group">
			<div class="group-label">Integrasi</div>
			<div class="group-note">Hubungkan layanan biar Ava bisa bantu lebih banyak.</div>
			<div class="set-list">
				{#each integrations as it (it.id)}
					<div class="set-row static">
						<Brand name={it.brand} size={38} />
						<span class="txt">
							<span class="t">{it.name}</span>
							<span class="d">{it.desc}</span>
						</span>
						{#if it.id === 'tuya'}
							<button class="intg-vip" onclick={toggleTuya}>
								<span class="vip-crown">✦</span> VIP
							</button>
						{:else if conn[it.id]}
							<button class="intg-on" onclick={() => (conn = { ...conn, [it.id]: false })}>
								<Icon name="check" size={13} /> Terhubung
							</button>
						{:else}
							<button class="intg-connect" onclick={() => (conn = { ...conn, [it.id]: true })}
								>Hubungkan</button
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
	{#if showTopup}
		<TopupModal onClose={() => (showTopup = false)} />
	{/if}
	{#if tuyaFloat}
		<TuyaVipFloat anchor={tuyaFloat.el} onClose={() => (tuyaFloat = null)} />
	{/if}
</aside>
