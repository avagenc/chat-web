<script>
	// simplified, non-exact integration marks (gmail / calendar / tuya)
	/** @type {{ name: string, size?: number }} */
	let { name, size = 40 } = $props();
	const radius = $derived(size * 0.28);
</script>

{#if name === 'gmail'}
	<div
		style="width:{size}px;height:{size}px;border-radius:{radius}px;display:grid;place-items:center;flex:none;background:#fff;border:1px solid rgba(44,35,28,0.1)"
	>
		<svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
			<path
				d="M2 6.5C2 5.7 2.7 5 3.5 5H4l8 6 8-6h.5c.8 0 1.5.7 1.5 1.5v11c0 .8-.7 1.5-1.5 1.5H20V9l-8 6-8-6v9.5H3.5C2.7 20 2 19.3 2 18.5z"
				fill="#EA4335"
			/>
		</svg>
	</div>
{:else if name === 'calendar'}
	<div
		style="width:{size}px;height:{size}px;border-radius:{radius}px;display:grid;place-items:center;flex:none;background:#fff;border:1px solid rgba(44,35,28,0.1);position:relative;overflow:hidden"
	>
		<svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
			<rect
				x="3.5"
				y="4.5"
				width="17"
				height="16"
				rx="2.5"
				fill="#fff"
				stroke="#4285F4"
				stroke-width="1.6"
			/>
			<rect x="3.5" y="4.5" width="17" height="4.5" rx="2.5" fill="#4285F4" />
			<text
				x="12"
				y="17.5"
				text-anchor="middle"
				font-size="8.5"
				font-weight="700"
				fill="#4285F4"
				font-family="Inter Tight, sans-serif">10</text
			>
		</svg>
	</div>
{:else}
	<div
		style="width:{size}px;height:{size}px;border-radius:{radius}px;display:grid;place-items:center;flex:none;background:linear-gradient(150deg,#FF6A2B,#F23C2E)"
	>
		<svg
			width={size * 0.52}
			height={size * 0.52}
			viewBox="0 0 24 24"
			fill="none"
			stroke="#fff"
			stroke-width="1.9"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M4 11.5 12 4l8 7.5" /><path d="M6 10.5V19h12v-8.5" /><path d="M10.5 19v-4h3v4" />
		</svg>
	</div>
{/if}
