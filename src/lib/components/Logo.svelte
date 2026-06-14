<script>
	// Avagenc logo mark in three fills; assets live in /static
	/** @type {{ size?: number, variant?: 'ink'|'accent'|'cream' }} */
	let { size = 24, variant = 'ink' } = $props();
	const src = $derived(
		variant === 'accent'
			? '/avagenc-accent.svg'
			: variant === 'cream'
				? '/avagenc-cream.svg'
				: '/avagenc-ink.svg'
	);
</script>

<img
	class="logo-mark"
	{src}
	alt="Avagenc"
	width={size}
	height={size}
	style="width:{size}px;height:{size}px"
/>
