<script>
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	// TOC groups — anchors match the section ids one-to-one, in document order.
	const tocGroups = [
		{
			title: 'Privasi',
			links: [
				{ id: 'data', label: 'Data yang kami akses' },
				{ id: 'tujuan', label: 'Tujuan penggunaan data' },
				{ id: 'akses', label: 'Siapa yang dapat mengakses' },
				{ id: 'retensi', label: 'Penyimpanan & retensi' },
				{ id: 'cabut', label: 'Cara mencabut akses' },
				{ id: 'google-api', label: 'Kepatuhan Google API' },
				{ id: 'keamanan', label: 'Keamanan' }
			]
		},
		{
			title: 'Ketentuan',
			links: [
				{ id: 'k-deskripsi', label: 'Deskripsi layanan' },
				{ id: 'k-akun', label: 'Akun terhubung' },
				{ id: 'k-penggunaan', label: 'Penggunaan yang diterima' },
				{ id: 'k-tanggung-jawab', label: 'Batasan tanggung jawab' },
				{ id: 'k-penghentian', label: 'Penghentian akses' },
				{ id: 'k-hukum', label: 'Hukum yang berlaku' }
			]
		}
	];
	const order = tocGroups.flatMap((g) => g.links.map((l) => l.id));

	let activeId = $state(order[0]);

	// Scroll-spy driven by scroll position (not IntersectionObserver) so the
	// highlight tracks the section actually being read — and never gets stuck on
	// a mid-page section when the page bottoms out.
	function computeActive() {
		const threshold = window.innerHeight * 0.3;
		const atBottom =
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
		if (atBottom) return order[order.length - 1];
		let active = order[0];
		for (const id of order) {
			const el = document.getElementById(id);
			if (el && el.getBoundingClientRect().top <= threshold) active = id;
			else break;
		}
		return active;
	}

	onMount(() => {
		let ticking = false;
		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				ticking = false;
				activeId = computeActive();
			});
		}
		activeId = computeActive();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<svelte:head>
	<title>Kebijakan Privasi &amp; Ketentuan Layanan — Avagenc</title>
	<meta
		name="description"
		content="Kebijakan Privasi dan Ketentuan Layanan Avagenc dalam satu halaman: data yang kami akses dari Google, Tuya Smart, dan Spotify, tujuan penggunaannya, cara mencabut akses, serta ketentuan penggunaan layanan."
	/>
	<link rel="icon" href="/avagenc-accent.svg" />
</svelte:head>

<div class="legalx">
	<div class="lx-topfade" aria-hidden="true"></div>

	<a class="lx-wordmark" href={resolve('/')} aria-label="Avagenc">
		<img class="lw-mark" src="/avagenc-ink.svg" alt="" />
		<span class="lw-name">Avagenc</span>
	</a>

	<div class="layout">
		<main class="doc">
			<!-- ===================== PRIVASI ===================== -->
			<article class="legal-doc" id="privasi">
				<h1>Kebijakan Privasi</h1>
				<div class="updated">Diperbarui 1 Juli 2026</div>

				<p class="lede">
					Avagenc (“kami”) menyediakan multi agentic assistants yang bisa terhubung ke berbagai
					layanan pihak ketiga Anda, yaitu Google (email, kalender, kontak), Tuya Smart (smart home
					devices), dan Spotify (musik), untuk membantu Anda menjalankan berbagai permintaan.
					Kebijakan ini menjelaskan data apa yang kami akses, kenapa kami mengaksesnya, bagaimana
					kami menyimpan dan melindunginya, serta cara Anda mencabut akses tersebut.
				</p>

				<section id="data">
					<h2><span class="num">1</span>Data yang kami akses</h2>
					<p>
						Ketika Anda menghubungkan sebuah akun, Anda memberi izin (scope) kepada Avagenc untuk
						mengakses data berikut, dan hanya sejauh diperlukan untuk menjalankan permintaan Anda.
						Anda hanya perlu menghubungkan layanan yang ingin Anda gunakan:
					</p>
					<div class="scopes">
						<div class="scope">
							<div class="s-head">
								<img class="s-logo" src="/gmail.webp" alt="" />
								<span class="s-name">Gmail</span>
							</div>
							<p class="s-desc">
								Membaca, menyusun, mengirim, dan mengubah pesan email atas permintaan Anda, misalnya
								menandai pesan sudah dibaca, membuat draf, atau mengirim balasan.
							</p>
						</div>
						<div class="scope">
							<div class="s-head">
								<img class="s-logo" src="/google-calendar.webp" alt="" />
								<span class="s-name">Google Calendar</span>
							</div>
							<p class="s-desc">Membaca acara serta membuat dan mengubah acara di kalender Anda.</p>
						</div>
						<div class="scope">
							<div class="s-head">
								<img class="s-logo" src="/google-contacts.webp" alt="" />
								<span class="s-name">Google Contacts</span>
							</div>
							<p class="s-desc">
								Membaca kontak dan menambahkan kontak baru untuk membantu menyusun email atau
								undangan acara.
							</p>
						</div>
						<div class="scope">
							<div class="s-head">
								<img class="s-logo" src="/tuya-smart.webp" alt="" />
								<span class="s-name">Tuya Smart</span>
							</div>
							<p class="s-desc">
								Membaca daftar perangkat rumah pintar yang terhubung beserta statusnya, dan mengirim
								perintah kontrol atas permintaan Anda, misalnya menyalakan atau mematikan lampu,
								mengatur AC, dan mengontrol colokan pintar.
							</p>
						</div>
						<div class="scope">
							<div class="s-head">
								<img class="s-logo" src="/spotify.webp" alt="" />
								<span class="s-name">Spotify</span>
							</div>
							<p class="s-desc">
								Mengakses profil dasar akun Spotify Anda, mencari lagu, membaca status pemutaran,
								dan mengendalikan pemutaran (memutar, menjeda, melanjutkan, atau mengganti lagu).
								Kontrol pemutaran membutuhkan akun Spotify Premium.
							</p>
						</div>
					</div>
					<p>Kami tidak meminta akses ke data lain yang tidak relevan dengan fungsi asisten.</p>
				</section>

				<section id="tujuan">
					<h2><span class="num">2</span>Tujuan penggunaan data</h2>
					<p>Data dari akun yang Anda hubungkan hanya kami pakai untuk:</p>
					<ul>
						<li>menjalankan tindakan yang Anda minta secara langsung melalui chat;</li>
						<li>
							menampilkan kembali informasi yang relevan, misalnya ringkasan email atau jadwal, di
							dalam percakapan;
						</li>
						<li>menjaga agar fitur yang terhubung tetap berfungsi.</li>
					</ul>
					<div class="callout">
						<p>
							Kami tidak menjual data Anda, tidak menggunakannya untuk iklan, dan tidak
							menggunakannya untuk melatih model kecerdasan buatan umum. Ini berlaku untuk seluruh
							layanan yang Anda hubungkan, termasuk Google, Tuya Smart, dan Spotify.
						</p>
					</div>
				</section>

				<section id="akses">
					<h2><span class="num">3</span>Siapa yang dapat mengakses data Anda</h2>
					<p>
						Akses data dibatasi pada sistem otomatis Avagenc yang memproses permintaan Anda dan pada
						personel yang berwenang bila diperlukan untuk pemeliharaan atau dukungan teknis. Kami
						tidak membagikan data akun Google Anda kepada pihak ketiga, kecuali penyedia
						infrastruktur yang menjalankan layanan atas nama kami seperti penyedia hosting, atau
						bila diwajibkan oleh hukum. Hal yang sama berlaku untuk data akun Tuya Smart dan Spotify
						Anda.
					</p>
				</section>

				<section id="retensi">
					<h2><span class="num">4</span>Penyimpanan dan retensi data</h2>
					<p>
						Kami hanya menyimpan data seperlunya untuk menjalankan permintaan Anda. Token akses dari
						layanan yang Anda hubungkan (Google, Tuya Smart, dan Spotify) disimpan dengan aman dan
						hanya digunakan untuk memanggil API masing-masing layanan atas nama Anda. Riwayat
						percakapan yang Anda buat disimpan agar Anda dapat melanjutkan konteks. Anda dapat
						menghapus riwayat tersebut kapan saja dari dalam aplikasi. Ketika Anda mencabut akses
						atau menghapus akun, token dan data terkait akan dihapus dari sistem aktif kami dalam
						waktu yang wajar.
					</p>
				</section>

				<section id="cabut">
					<h2><span class="num">5</span>Cara mencabut akses</h2>
					<p>
						Anda dapat mencabut akses Avagenc ke akun yang terhubung kapan saja melalui metode
						berikut:
					</p>

					<p
						style="margin: 16px 0 8px; font-size: 15px; color: var(--ink); font-weight: 600; font-family: var(--sans);"
					>
						Melalui Aplikasi Avagenc (Langsung):
					</p>
					<ul>
						<li>
							<strong>Sidebar Profil:</strong> Buka sidebar profil Anda, lalu klik tombol status
							<strong>“Terhubung”</strong> di samping nama layanan yang ingin diputuskan untuk menonaktifkan
							integrasi secara langsung; atau
						</li>
						<li>
							<strong>Agentic:</strong> Cukup ketik perintah di kolom obrolan chat, asistan akan
							memutuskan koneksi sesuai permintaan ada (misalnya, dengan mengetik
							<em>“disconnect Spotify saya”</em>, <em>“disconnect Google”</em>, atau
							<em>“cabut akses Tuya”</em>).
						</li>
					</ul>

					<p
						style="margin: 20px 0 8px; font-size: 15px; color: var(--ink); font-weight: 600; font-family: var(--sans);"
					>
						Melalui Pengaturan Layanan Pihak Ketiga (Provider-Side):
					</p>
					<ul>
						<li>
							<strong>Google:</strong> melalui halaman
							<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener"
								>Izin Akun Google</a
							>, pilih Avagenc lalu klik “Hapus Akses”;
						</li>
						<li>
							<strong>Spotify:</strong> melalui halaman
							<a href="https://www.spotify.com/account/apps/" target="_blank" rel="noopener"
								>Aplikasi Akun Spotify</a
							>, lalu pilih “Remove Access” pada Avagenc;
						</li>
						<li>
							<strong>Tuya Smart:</strong> melalui pengaturan otorisasi pihak ketiga di aplikasi Tuya
							Smart atau Smart Life Anda; atau
						</li>
						<li>
							<strong>Dukungan Teknis:</strong> untuk layanan apa pun, dengan menghubungi kami
							melalui email di
							<a href="mailto:ardian@avagenc.com">ardian@avagenc.com</a>.
						</li>
					</ul>
					<p style="margin-top: 16px;">
						Setelah akses dicabut, Avagenc tidak lagi dapat mengakses data pada akun tersebut.
					</p>
				</section>

				<section id="google-api">
					<h2><span class="num">6</span>Kepatuhan Google API Services User Data Policy</h2>
					<div class="callout">
						<p>
							Penggunaan dan pengalihan informasi yang diterima Avagenc dari Google API mematuhi
							<a
								href="https://developers.google.com/terms/api-services-user-data-policy"
								target="_blank"
								rel="noopener">Google API Services User Data Policy</a
							>, termasuk persyaratan Penggunaan Terbatas (Limited Use). Kami tidak mengalihkan,
							menggunakan, atau menyimpan data pengguna Google untuk tujuan apa pun di luar yang
							dijelaskan dalam kebijakan ini.
						</p>
					</div>
				</section>

				<section id="keamanan">
					<h2><span class="num">7</span>Keamanan</h2>
					<p>
						Kami menerapkan langkah pengamanan teknis dan organisasional yang wajar untuk melindungi
						data Anda, termasuk enkripsi saat transit. Namun, tidak ada sistem yang sepenuhnya bebas
						risiko, dan kami tidak dapat menjamin keamanan mutlak.
					</p>
				</section>
			</article>

			<!-- ===================== KETENTUAN ===================== -->
			<article class="legal-doc" id="ketentuan">
				<h1>Ketentuan Layanan</h1>
				<div class="updated">Diperbarui 1 Juli 2026</div>

				<p class="lede">
					Ketentuan Layanan ini (“Ketentuan”) mengatur penggunaan Anda atas Avagenc (“Layanan”),
					sebuah layanan multi agentic assistants. Dengan mengakses atau menggunakan Layanan, Anda
					menyetujui Ketentuan ini. Bila Anda tidak menyetujuinya, mohon untuk tidak menggunakan
					Layanan.
				</p>

				<section id="k-deskripsi">
					<h2><span class="num">1</span>Deskripsi layanan</h2>
					<p>
						Avagenc menyediakan antarmuka chat yang dapat terhubung ke layanan pihak ketiga seperti
						Gmail, Google Calendar, dan Google Contacts (mengelola email, jadwal, dan kontak), Tuya
						Smart (mengontrol tuya smart home devices seperti lampu, AC, dan colokan), serta Spotify
						(mencari dan mengendalikan pemutaran musik), melalui perintah Anda. Layanan dapat
						berubah atau berkembang seiring waktu.
					</p>
				</section>

				<section id="k-akun">
					<h2><span class="num">2</span>Akun dan layanan yang terhubung</h2>
					<p>
						Fitur mengharuskan Anda menghubungkan akun pihak ketiga, seperti akun Google, Tuya
						Smart, atau Spotify. Dengan menghubungkan akun, Anda memberi wewenang kepada Avagenc
						untuk mengakses dan bertindak atas data pada akun tersebut sesuai izin yang Anda berikan
						dan sebagaimana dijelaskan dalam <a href="#privasi">Kebijakan Privasi</a> kami. Anda bertanggung
						jawab untuk:
					</p>
					<ul>
						<li>memastikan Anda berhak menghubungkan akun tersebut;</li>
						<li>menjaga kerahasiaan kredensial Anda;</li>
						<li>
							meninjau tindakan yang dilakukan Layanan atas nama Anda, misalnya email yang dikirim,
							acara yang dibuat, perangkat rumah pintar yang dikontrol, atau pemutaran musik yang
							diubah.
						</li>
					</ul>
				</section>

				<section id="k-penggunaan">
					<h2><span class="num">3</span>Penggunaan yang dapat diterima</h2>
					<p>Anda setuju untuk tidak menggunakan Layanan untuk:</p>
					<ul>
						<li>melanggar hukum yang berlaku atau hak pihak lain;</li>
						<li>mengirim spam, konten menyesatkan, atau perangkat lunak berbahaya;</li>
						<li>
							mencoba mengakses sistem atau data yang bukan hak Anda, atau mengganggu operasi
							Layanan.
						</li>
					</ul>
				</section>

				<section id="k-tanggung-jawab">
					<h2><span class="num">4</span>Batasan tanggung jawab</h2>
					<p>
						Sepanjang diizinkan oleh hukum yang berlaku, Layanan disediakan “sebagaimana adanya” dan
						“sebagaimana tersedia”, tanpa jaminan apa pun. Avagenc tidak bertanggung jawab atas
						kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau
						ketidakmampuan menggunakan Layanan, termasuk namun tidak terbatas pada tindakan yang
						dilakukan pada akun terhubung atas permintaan Anda.
					</p>
				</section>

				<section id="k-penghentian">
					<h2><span class="num">5</span>Penghentian dan pencabutan akses</h2>
					<p>
						Anda bisa berhenti menggunakan Layanan kapan saja dan mencabut akses ke akun terhubung
						langsung melalui menu integrasi di sidebar profil Anda, perintah chat asisten, atau
						lewat pengaturan masing-masing pihak ketiga seperti
						<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener"
							>Izin Akun Google</a
						>,
						<a href="https://www.spotify.com/account/apps/" target="_blank" rel="noopener"
							>Aplikasi Akun Spotify</a
						>, pengaturan otorisasi di aplikasi Tuya Smart atau Smart Life, atau dengan menghubungi
						kami. Cara mencabut akses selengkapnya ada di bagian
						<a href="#cabut">Cara mencabut akses</a> pada Kebijakan Privasi di atas. Kami dapat menangguhkan
						atau menghentikan akses Anda ke Layanan bila Anda melanggar Ketentuan ini atau bila diperlukan
						untuk melindungi Layanan atau pengguna lain.
					</p>
				</section>

				<section id="k-hukum">
					<h2><span class="num">6</span>Hukum yang berlaku</h2>
					<p>
						Ketentuan ini diatur oleh hukum [TBD]. Yurisdiksi dan entitas hukum resmi Avagenc akan
						dilengkapi di sini setelah tersedia.
					</p>
				</section>
			</article>
		</main>

		<aside class="toc-rail" aria-label="Daftar isi">
			<nav class="toc">
				{#each tocGroups as group (group.title)}
					<span class="toc-group-title">{group.title}</span>
					{#each group.links as link (link.id)}
						<a
							href="#{link.id}"
							class:active={activeId === link.id}
							onclick={() => (activeId = link.id)}>{link.label}</a
						>
					{/each}
				{/each}
			</nav>
		</aside>
	</div>

	<footer class="page-foot">
		<div class="foot-inner">
			<p class="foot-note">
				Kebijakan &amp; ketentuan dapat berubah seiring waktu. Perubahan material akan ditandai
				dengan pembaruan tanggal di atas.
			</p>
			<a class="foot-mail" href="mailto:ardian@avagenc.com">
				<svg
					class="foot-mail-ic"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="3" y="5" width="18" height="14" rx="2.5"></rect>
					<path d="M4 7.5l8 5 8-5"></path>
				</svg>
				ardian@avagenc.com
			</a>
			<img class="foot-mark" src="/avagenc-ink.svg" alt="Avagenc" />
		</div>
	</footer>
</div>

<style>
	/* Page-local token tweaks — the /legal handoff uses slightly softer ink and a
	   1px larger small radius than the chat app's :root defaults. */
	.legalx {
		--ink-muted: rgba(44, 35, 28, 0.58);
		--ink-faint: rgba(44, 35, 28, 0.4);
		--radius-sm: 11px;
		--rail: 250px;
		--contentw: 680px;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
	/* paper grain */
	:global(body::before) {
		content: '';
		position: fixed;
		inset: 0;
		pointer-events: none;
		opacity: 0.5;
		background-image: radial-gradient(rgba(44, 35, 28, 0.022) 1px, transparent 1px);
		background-size: 4px 4px;
		z-index: 0;
	}
	:global(::selection) {
		background: var(--accent-tint-strong);
	}

	/* ---- Floating wordmark (top-left, back to app) ---- */
	.lx-wordmark {
		position: fixed;
		top: 26px;
		left: 30px;
		z-index: 20;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		text-decoration: none;
	}
	.lw-mark {
		width: 23px;
		height: 23px;
		flex: none;
	}
	.lw-name {
		font-family: var(--serif);
		font-size: 19px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
		line-height: 1;
	}

	/* ---- TOC rail ---- */
	.toc-rail {
		position: sticky;
		top: 0;
		height: 100vh;
		width: var(--rail);
		z-index: 10;
		display: none;
		flex-direction: column;
		justify-content: center;
		padding: 104px 4px 40px 4px;
	}
	.toc {
		display: flex;
		flex-direction: column;
		gap: 3px;
		overflow-y: auto;
		margin: 0 -6px;
		padding: 4px 6px;
		max-height: 100%;
		scrollbar-width: thin;
		scrollbar-color: var(--ink-ghost) transparent;
	}
	.toc::-webkit-scrollbar {
		width: 5px;
	}
	.toc::-webkit-scrollbar-thumb {
		background: var(--ink-ghost);
		border-radius: 3px;
	}
	.toc-group-title {
		font-family: var(--sans);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent-deep);
		padding: 0 10px;
		margin: 18px 0 7px;
	}
	.toc-group-title:first-child {
		margin-top: 2px;
	}
	.toc a {
		font-family: var(--sans);
		font-size: 13.5px;
		font-weight: 450;
		line-height: 1.35;
		color: var(--ink-muted);
		text-decoration: none;
		padding: 6px 10px;
		border-radius: 8px;
		border-left: 2px solid transparent;
		transition:
			background 0.15s var(--ease),
			color 0.15s var(--ease),
			border-color 0.15s var(--ease);
	}
	.toc a:hover {
		background: var(--accent-tint);
		color: var(--accent-deep);
	}
	.toc a.active {
		color: var(--accent-deep);
		background: var(--accent-tint);
		border-left-color: var(--accent);
		font-weight: 500;
	}

	/* ---- Top fade over content ---- */
	.lx-topfade {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 88px;
		z-index: 5;
		pointer-events: none;
		background: linear-gradient(to bottom, var(--bg) 12%, transparent);
	}

	/* ---- Main document ---- */
	.layout {
		position: relative;
		z-index: 1;
	}
	.doc {
		max-width: var(--contentw);
		margin: 0 auto;
		padding: 104px 32px 40px;
	}

	.legal-doc {
		animation: fade 0.4s var(--ease) both;
	}
	.legal-doc + .legal-doc {
		margin-top: 88px;
		padding-top: 72px;
		border-top: 1px solid var(--line);
	}
	@keyframes fade {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.legal-doc h1 {
		font-family: var(--serif);
		font-weight: 500;
		font-size: clamp(30px, 5vw, 40px);
		line-height: 1.1;
		letter-spacing: -0.015em;
		color: var(--ink);
		margin: 0 0 10px;
		text-wrap: balance;
		scroll-margin-top: 40px;
	}
	.updated {
		font-family: var(--sans);
		font-size: 12.5px;
		font-weight: 450;
		color: var(--ink-faint);
		letter-spacing: 0.01em;
		margin: 0;
	}
	.lede {
		font-family: var(--serif);
		font-size: 19px;
		line-height: 1.62;
		color: var(--ink-soft);
		margin: 22px 0 0;
		text-wrap: pretty;
	}

	.legal-doc section {
		margin-top: 42px;
		scroll-margin-top: 40px;
	}
	.legal-doc h2 {
		font-family: var(--serif);
		font-weight: 500;
		font-size: 23px;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0 0 14px;
		display: flex;
		gap: 12px;
		align-items: baseline;
	}
	.legal-doc h2 .num {
		font-family: var(--sans);
		font-size: 13px;
		font-weight: 600;
		color: var(--accent);
		flex: none;
		min-width: 18px;
		transform: translateY(-1px);
		font-variant-numeric: tabular-nums;
	}

	.legal-doc p {
		font-family: var(--serif);
		font-size: 17px;
		line-height: 1.68;
		color: var(--ink-soft);
		margin: 0 0 14px;
		text-wrap: pretty;
	}
	.legal-doc p:last-child {
		margin-bottom: 0;
	}

	.legal-doc a {
		color: var(--accent-deep);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-thickness: 1px;
		text-decoration-color: var(--accent-tint-strong);
		transition: text-decoration-color 0.16s var(--ease);
		word-break: break-word;
	}
	.legal-doc a:hover {
		text-decoration-color: var(--accent-deep);
	}

	.legal-doc ul {
		list-style: none;
		margin: 4px 0 14px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 11px;
	}
	.legal-doc li {
		font-family: var(--serif);
		font-size: 17px;
		line-height: 1.62;
		color: var(--ink-soft);
		padding-left: 26px;
		position: relative;
		text-wrap: pretty;
	}
	.legal-doc li::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 12px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
	}
	.legal-doc li strong {
		font-weight: 600;
		color: var(--ink);
	}

	/* ---- Callout ---- */
	.callout {
		margin: 20px 0 0;
		background: var(--accent-tint);
		border: 1px solid var(--accent-tint-strong);
		border-radius: var(--radius);
		padding: 18px 20px;
	}
	.callout p {
		color: var(--ink);
		margin: 0;
	}

	/* ---- Scopes ---- */
	.scopes {
		margin: 6px 0 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.scope {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		padding: 15px 17px;
	}
	.scope .s-head {
		display: flex;
		align-items: center;
		gap: 9px;
		flex: none;
		width: 132px;
		padding-top: 1px;
	}
	.scope .s-logo {
		width: 22px;
		height: 22px;
		flex: none;
		border-radius: 5px;
		object-fit: contain;
	}
	.scope .s-name {
		font-family: var(--sans);
		font-size: 13.5px;
		font-weight: 600;
		color: var(--ink);
		min-width: 0;
	}
	.scope .s-desc {
		font-family: var(--serif);
		font-size: 16px;
		line-height: 1.55;
		color: var(--ink-soft);
		margin: 0;
		flex: 1;
		min-width: 0;
	}
	@media (max-width: 480px) {
		.scope {
			flex-direction: column;
			gap: 5px;
		}
		.scope .s-head {
			width: auto;
		}
	}

	/* ---- Footer (silver band) ---- */
	.page-foot {
		position: relative;
		z-index: 1;
		margin-top: 96px;
		padding: 52px 32px 60px;
		background: linear-gradient(to bottom, #eceae5, #e2e0da);
		border-top: 1px solid rgba(44, 35, 28, 0.14);
	}
	.foot-inner {
		max-width: var(--contentw);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}
	.foot-note {
		font-family: var(--sans);
		font-size: 13px;
		font-weight: 450;
		line-height: 1.6;
		color: #6c6a64;
		max-width: 480px;
		margin: 0;
		text-wrap: pretty;
	}
	.foot-mail {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--sans);
		font-size: 13.5px;
		font-weight: 500;
		color: #57554f;
		text-decoration: none;
		transition: color 0.16s var(--ease);
	}
	.foot-mail:hover {
		color: var(--ink);
	}
	.foot-mail-ic {
		flex: none;
		opacity: 0.9;
	}
	.foot-mark {
		width: 24px;
		height: 24px;
		opacity: 0.5;
		filter: grayscale(1);
	}

	/* ---- Reveal rail on wide screens; center content beside it ---- */
	@media (min-width: 1080px) {
		.layout {
			display: grid;
			grid-template-columns: var(--rail) var(--contentw);
			column-gap: 60px;
			justify-content: center;
			align-items: start;
		}
		.doc {
			grid-column: 2;
			grid-row: 1;
			max-width: none;
			margin: 0;
		}
		.toc-rail {
			display: flex;
			grid-column: 1;
			grid-row: 1;
		}
	}

	/* ---- Narrow screens ---- */
	@media (max-width: 640px) {
		.doc {
			padding: 92px 20px 32px;
		}
		.lx-wordmark {
			top: 20px;
			left: 20px;
		}
		.legal-doc + .legal-doc {
			margin-top: 64px;
			padding-top: 52px;
		}
	}
	@media (max-width: 480px) {
		.doc {
			padding: 86px 16px 28px;
		}
	}

	/* ---- Print ---- */
	@media print {
		.toc-rail,
		.lx-wordmark,
		.lx-topfade {
			display: none;
		}
		:global(body::before) {
			display: none;
		}
		:global(body) {
			background: #fff;
		}
		.layout {
			display: block;
		}
		.doc {
			grid-column: auto;
			margin: 0 auto;
			padding-left: 0;
			padding-right: 0;
		}
		.legal-doc {
			animation: none;
		}
		.legal-doc + .legal-doc {
			break-before: page;
		}
		.callout,
		.scope {
			break-inside: avoid;
		}
		.legal-doc section {
			break-inside: avoid-page;
		}
		.legal-doc a {
			color: var(--ink);
		}
	}
</style>
