<script>
	import Logo from '$lib/components/Logo.svelte';

	const updated = '1 Juli 2026';
	const contact = 'ardian@avagenc.com';
</script>

<svelte:head>
	<title>Kebijakan Privasi · Avagenc</title>
	<meta
		name="description"
		content="Kebijakan Privasi Avagenc: bagaimana kami mengakses, menggunakan, menyimpan, dan melindungi data akun yang Anda hubungkan, yaitu Google, Tuya Smart, dan Spotify."
	/>
</svelte:head>

<div class="legal">
	<header class="legal-top">
		<a class="legal-brand" href="/">
			<Logo size={22} />
			<span>Avagenc</span>
		</a>
		<a class="legal-nav" href="/terms">Ketentuan Layanan</a>
	</header>

	<main class="legal-body">
		<p class="legal-kicker">Kebijakan Privasi</p>
		<h1>Kebijakan Privasi Avagenc</h1>
		<p class="legal-meta">Terakhir diperbarui: {updated}</p>

		<p>
			Avagenc (“kami”) menyediakan multi agentic assistants yang bisa terhubung ke berbagai layanan
			pihak ketiga Anda, yaitu Google (email, kalender, kontak), Tuya Smart (smart home devices),
            dan Spotify (musik), untuk membantu Anda menjalankan berbagai permintaan. Kebijakan ini
            menjelaskan data apa yang kami akses, kenapa kami mengaksesnya, bagaimana kami menyimpan
			dan melindunginya, serta cara Anda mencabut akses tersebut.
		</p>

		<h2>1. Data yang kami akses</h2>
		<p>
			Ketika Anda menghubungkan sebuah akun, Anda memberi izin (scope) kepada Avagenc untuk
			mengakses data berikut, dan hanya sejauh diperlukan untuk menjalankan permintaan Anda. Anda
			hanya perlu menghubungkan layanan yang ingin Anda gunakan:
		</p>
		<ul>
			<li>
				<strong>Gmail</strong>: membaca, menyusun, mengirim, dan mengubah pesan email atas
				permintaan Anda, misalnya menandai pesan sudah dibaca, membuat draf, atau mengirim balasan.
			</li>
			<li>
				<strong>Google Calendar</strong>: membaca acara serta membuat dan mengubah acara di kalender
				Anda.
			</li>
			<li>
				<strong>Google Contacts</strong>: membaca kontak dan menambahkan kontak baru untuk membantu
				menyusun email atau undangan acara.
			</li>
			<li>
				<strong>Tuya Smart</strong>: membaca daftar perangkat rumah pintar yang terhubung beserta
				statusnya, dan mengirim perintah kontrol atas permintaan Anda, misalnya menyalakan atau
				mematikan lampu, mengatur AC, dan mengontrol colokan pintar.
			</li>
			<li>
				<strong>Spotify</strong>: mengakses profil dasar akun Spotify Anda, mencari lagu, membaca
				status pemutaran, dan mengendalikan pemutaran (memutar, menjeda, melanjutkan, atau mengganti
				lagu). Kontrol pemutaran membutuhkan akun Spotify Premium.
			</li>
		</ul>
		<p>Kami tidak meminta akses ke data lain yang tidak relevan dengan fungsi asisten.</p>

		<h2>2. Tujuan penggunaan data</h2>
		<p>Data dari akun yang Anda hubungkan hanya kami pakai untuk:</p>
		<ul>
			<li>menjalankan tindakan yang Anda minta secara langsung melalui chat;</li>
			<li>
				menampilkan kembali informasi yang relevan, misalnya ringkasan email atau jadwal, di dalam
				percakapan;
			</li>
			<li>menjaga agar fitur yang terhubung tetap berfungsi.</li>
		</ul>
		<p>
			Kami <strong>tidak</strong> menjual data Anda, tidak menggunakannya untuk iklan, dan tidak menggunakannya
			untuk melatih model kecerdasan buatan umum. Ini berlaku untuk seluruh layanan yang Anda hubungkan,
			termasuk Google, Tuya Smart, dan Spotify.
		</p>

		<h2>3. Siapa yang dapat mengakses data Anda</h2>
		<p>
			Akses data dibatasi pada sistem otomatis Avagenc yang memproses permintaan Anda dan pada
			personel yang berwenang bila diperlukan untuk pemeliharaan atau dukungan teknis. Kami tidak
			membagikan data akun Google Anda kepada pihak ketiga, kecuali penyedia infrastruktur yang
			menjalankan layanan atas nama kami seperti penyedia hosting, atau bila diwajibkan oleh hukum.
			Hal yang sama berlaku untuk data akun Tuya Smart dan Spotify Anda.
		</p>

		<h2>4. Penyimpanan dan retensi data</h2>
		<p>
			Kami hanya menyimpan data seperlunya untuk menjalankan permintaan Anda. Token akses dari
			layanan yang Anda hubungkan (Google, Tuya Smart, dan Spotify) disimpan dengan aman dan hanya
			digunakan untuk memanggil API masing-masing layanan atas nama Anda. Riwayat percakapan yang
			Anda buat disimpan agar Anda dapat melanjutkan konteks. Anda dapat menghapus riwayat tersebut
			kapan saja dari dalam aplikasi. Ketika Anda mencabut akses atau menghapus akun, token dan data
			terkait akan dihapus dari sistem aktif kami dalam waktu yang wajar.
		</p>

		<h2>5. Cara mencabut akses</h2>
		<p>Anda dapat mencabut akses Avagenc ke akun yang terhubung kapan saja:</p>
		<ul>
			<li>
				<strong>Google</strong>: melalui halaman
				<a href="https://myaccount.google.com/permissions" rel="noreferrer"> Izin Akun Google </a>,
				pilih Avagenc lalu “Hapus Akses”;
			</li>
			<li>
				<strong>Spotify</strong>: melalui halaman
				<a href="https://www.spotify.com/account/apps/" rel="noreferrer">
					Aplikasi Akun Spotify
				</a>, lalu “Remove Access” pada Avagenc;
			</li>
			<li>
				<strong>Tuya Smart</strong>: melalui pengaturan otorisasi pihak ketiga di aplikasi Tuya
				Smart atau Smart Life Anda; atau
			</li>
			<li>untuk layanan apa pun, dengan menghubungi kami di {contact}.</li>
		</ul>
		<p>Setelah akses dicabut, Avagenc tidak lagi dapat mengakses data pada akun tersebut.</p>

		<h2>6. Kepatuhan Google API Services User Data Policy</h2>
		<p>
			Penggunaan dan pengalihan informasi yang diterima Avagenc dari Google API mematuhi
			<a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noreferrer">
				Google API Services User Data Policy
			</a>, termasuk persyaratan Penggunaan Terbatas (Limited Use). Kami tidak mengalihkan,
			menggunakan, atau menyimpan data pengguna Google untuk tujuan apa pun di luar yang dijelaskan
			dalam kebijakan ini.
		</p>

		<h2>7. Keamanan</h2>
		<p>
			Kami menerapkan langkah pengamanan teknis dan organisasional yang wajar untuk melindungi data
			Anda, termasuk enkripsi saat transit. Namun, tidak ada sistem yang sepenuhnya bebas risiko,
			dan kami tidak dapat menjamin keamanan mutlak.
		</p>

		<h2>8. Perubahan kebijakan</h2>
		<p>
			Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan material akan ditandai
			dengan pembaruan tanggal “Terakhir diperbarui” di atas.
		</p>

		<h2>9. Kontak</h2>
		<p>
			Untuk pertanyaan terkait privasi atau permintaan penghapusan data, hubungi kami di <a
				href="mailto:{contact}">{contact}</a
			>.
		</p>
	</main>
</div>
