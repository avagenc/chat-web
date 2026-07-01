<script>
	import Logo from '$lib/components/Logo.svelte';

	const updated = '1 Juli 2026';
	const contact = 'ardian@avagenc.com';
</script>

<svelte:head>
	<title>Ketentuan Layanan · Avagenc</title>
	<meta
		name="description"
		content="Ketentuan Layanan Avagenc: syarat penggunaan asisten percakapan multi-agen dan akun yang terhubung (Google, Tuya Smart, Spotify)."
	/>
</svelte:head>

<div class="legal">
	<header class="legal-top">
		<a class="legal-brand" href="/">
			<Logo size={22} />
			<span>Avagenc</span>
		</a>
		<a class="legal-nav" href="/privacy">Kebijakan Privasi</a>
	</header>

	<main class="legal-body">
		<p class="legal-kicker">Ketentuan Layanan</p>
		<h1>Ketentuan Layanan Avagenc</h1>
		<p class="legal-meta">Terakhir diperbarui: {updated}</p>

		<p>
			Ketentuan Layanan ini (“Ketentuan”) mengatur penggunaan Anda atas Avagenc (“Layanan”), sebuah
			layanan muti agentic assistants. Dengan mengakses atau menggunakan Layanan, Anda menyetujui
			Ketentuan ini. Bila Anda tidak menyetujuinya, mohon untuk tidak menggunakan Layanan.
		</p>

		<h2>1. Deskripsi layanan</h2>
		<p>
			Avagenc menyediakan antarmuka chat yang dapat terhubung ke layanan pihak ketiga seperti Gmail,
			Google Calendar, dan Google Contacts (mengelola email, jadwal, dan kontak), Tuya Smart
			(mengontrol tuya smart home devices seperti lampu, AC, dan colokan), serta Spotify (mencari dan
			mengendalikan pemutaran musik), melalui perintah anda. Layanan dapat berubah atau
			berkembang seiring waktu.
		</p>

		<h2>2. Akun dan layanan yang terhubung</h2>
		<p>
			Fitur mengharuskan Anda menghubungkan akun pihak ketiga, seperti akun Google, Tuya
			Smart, atau Spotify. Dengan menghubungkan akun, Anda memberi wewenang kepada Avagenc untuk
			mengakses dan bertindak atas data pada akun tersebut sesuai izin yang Anda berikan dan
			sebagaimana dijelaskan dalam
			<a href="/privacy">Kebijakan Privasi</a> kami. Anda bertanggung jawab untuk:
		</p>
		<ul>
			<li>memastikan Anda berhak menghubungkan akun tersebut;</li>
			<li>menjaga kerahasiaan kredensial Anda;</li>
			<li>
				meninjau tindakan yang dilakukan Layanan atas nama Anda, misalnya email yang dikirim, acara
				yang dibuat, perangkat rumah pintar yang dikontrol, atau pemutaran musik yang diubah.
			</li>
		</ul>

		<h2>3. Penggunaan yang dapat diterima</h2>
		<p>Anda setuju untuk tidak menggunakan Layanan untuk:</p>
		<ul>
			<li>melanggar hukum yang berlaku atau hak pihak lain;</li>
			<li>mengirim spam, konten menyesatkan, atau perangkat lunak berbahaya;</li>
			<li>
				mencoba mengakses sistem atau data yang bukan hak Anda, atau mengganggu operasi Layanan.
			</li>
		</ul>

		<h2>4. Batasan tanggung jawab</h2>
		<p>
			Sepanjang diizinkan oleh hukum yang berlaku, Layanan disediakan “sebagaimana adanya” dan
			“sebagaimana tersedia”, tanpa jaminan apa pun. Avagenc tidak bertanggung jawab atas kerugian
			tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan
			menggunakan Layanan, termasuk namun tidak terbatas pada tindakan yang dilakukan pada akun
			terhubung atas permintaan Anda.
		</p>

		<h2>5. Penghentian dan pencabutan akses</h2>
		<p>
			Anda bisa berhenti menggunakan Layanan kapan saja dan mencabut akses ke akun terhubung lewat
			<a href="https://myaccount.google.com/permissions" rel="noreferrer">Izin Akun Google</a>,
			<a href="https://www.spotify.com/account/apps/" rel="noreferrer">Aplikasi Akun Spotify</a>,
			pengaturan otorisasi di aplikasi Tuya Smart atau Smart Life, atau dengan menghubungi kami.
			Cara mencabut akses selengkapnya ada di <a href="/privacy">Kebijakan Privasi</a> kami. Kami dapat
			menangguhkan atau menghentikan akses Anda ke Layanan bila Anda melanggar Ketentuan ini atau bila
			diperlukan untuk melindungi Layanan atau pengguna lain.
		</p>

		<h2>6. Hukum yang berlaku</h2>
		<p>
			Ketentuan ini diatur oleh hukum <span class="legal-tbd">[TBD]</span>. Yurisdiksi dan entitas
			hukum resmi Avagenc akan dilengkapi di sini setelah tersedia.
		</p>

		<h2>7. Perubahan ketentuan</h2>
		<p>
			Kami dapat memperbarui Ketentuan ini dari waktu ke waktu. Perubahan material akan ditandai
			dengan pembaruan tanggal “Terakhir diperbarui” di atas. Penggunaan Layanan yang berlanjut
			berarti Anda menerima Ketentuan yang diperbarui.
		</p>

		<h2>8. Kontak</h2>
		<p>
			Untuk pertanyaan terkait Ketentuan ini, hubungi kami di
			<a href="mailto:{contact}">{contact}</a>.
		</p>
	</main>
</div>
