<script>
	/* Indikator processing umum — satu untuk semua agent (orkestrasi terjadi
	   di server; giliran agent yang sebenarnya muncul lewat poll thread).
	   Mark Avagenc ukuran tetap: ink dengan sapuan kilau putih (`.mark-sweep`)
	   + status whimsical yang berganti-ganti. */
	const STATUSES = [
		'combobulating',
		'bomboclating',
		'invading syria',
		'gatau ah males',
		'praying',
		'manifesting',
		'reticulating splines',
		'ngopi dulu bentar',
		'summoning the council',
		'menghitung domba',
		'downloading wisdom',
		'percolating',
		'mikir keras banget',
		'consulting the elders',
		'menata ulang alam semesta',
		'polishing neurons'
	];
	/** Lama tiap status tampil sebelum ganti. */
	const DWELL_MS = 2400;

	const order = [...STATUSES].sort(() => Math.random() - 0.5);
	let idx = $state(0);

	$effect(() => {
		const t = setInterval(() => {
			idx = (idx + 1) % order.length;
		}, DWELL_MS);
		return () => clearInterval(t);
	});
</script>

<!-- mark + status telanjang — tanpa lingkaran avatar, tanpa bubble chat -->
<div class="row agent thinking">
	<div class="bubble-wrap">
		<div class="mark-slot"><span class="mark-sweep" aria-hidden="true"></span></div>
		{#key idx}
			<span class="thinking-status">{order[idx]}…</span>
		{/key}
	</div>
</div>
