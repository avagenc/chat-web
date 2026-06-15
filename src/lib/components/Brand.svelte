<script>
	// integration brand marks rendered from webp logos in /static
	/** @type {{ name: string, size?: number }} */
	let { name, size = 40 } = $props();
	const radius = $derived(size * 0.28);

	/** @type {Record<string, string>} */
	const SRC = {
		gmail: '/gmail.webp',
		calendar: '/google-calendar.webp',
		tuya: '/tuya-smart.webp',
		spotify: '/spotify.webp'
	};
	const src = $derived(SRC[name] ?? SRC.gmail);
</script>

<div
	style="width:{size}px;height:{size}px;border-radius:{radius}px;display:grid;place-items:center;flex:none;background:#fff;border:1px solid rgba(44,35,28,0.1);overflow:hidden"
>
	<img
		{src}
		alt={name}
		width={size}
		height={size}
		style="width:100%;height:100%;object-fit:contain"
		loading="lazy"
	/>
</div>
