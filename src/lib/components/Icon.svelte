<script>
	// inline 24×24 stroke icons (stroke:currentColor) — ported from bits.jsx
	/** @type {{ name: string, size?: number, stroke?: number }} */
	let { name, size = 20, stroke = 1.7 } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if name === 'settings'}
		<line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.4" fill="var(--bg)" />
		<line x1="4" y1="13" x2="20" y2="13" /><circle cx="15" cy="13" r="2.4" fill="var(--bg)" />
		<line x1="4" y1="19" x2="20" y2="19" /><circle cx="8" cy="19" r="2.4" fill="var(--bg)" />
	{:else if name === 'mic'}
		<rect x="9" y="3" width="6" height="11" rx="3" />
		<path d="M6 11a6 6 0 0 0 12 0" /><line x1="12" y1="17" x2="12" y2="21" /><line
			x1="9"
			y1="21"
			x2="15"
			y2="21"
		/>
	{:else if name === 'image'}
		<rect x="3" y="4.5" width="18" height="15" rx="2.5" />
		<circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 16l-5-5L5 19" />
	{:else if name === 'send'}
		<path d="M5 12h13M13 6l6 6-6 6" />
	{:else if name === 'play'}
		<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
	{:else if name === 'pause'}
		<rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
		<rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none" />
	{:else if name === 'x'}
		<line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
	{:else if name === 'chev'}
		<path d="M9 6l6 6-6 6" />
	{:else if name === 'trash'}
		<path
			d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
		/>
	{:else if name === 'brain'}
		<path
			d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V16a3 3 0 0 0 4 2.8M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V16a3 3 0 0 1-4 2.8M12 4v15"
		/>
	{:else if name === 'exit'}
		<path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 12H3M6 8l-4 4 4 4" />
	{:else if name === 'check'}
		<path d="M5 12.5l4.5 4.5L19 6.5" />
	{:else if name === 'retry'}
		<path d="M4 12a8 8 0 1 1 2.5 5.8M4 18v-4h4" />
	{:else if name === 'alert'}
		<circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><circle
			cx="12"
			cy="16.3"
			r="0.4"
			fill="currentColor"
		/>
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
	{:else if name === 'up'}
		<path d="M12 19V6M6 12l6-6 6 6" />
	{:else if name === 'down'}
		<path d="M12 5v13M18 12l-6 6-6-6" />
	{:else if name === 'spark'}
		<path d="M13 3L5 13h6l-1 8 8-10h-6z" />
	{:else if name === 'plus'}
		<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
	{:else if name === 'user'}
		<circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" />
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" /><circle
			cx="12"
			cy="7.6"
			r="0.4"
			fill="currentColor"
		/>
	{:else if name === 'copy'}
		<rect x="9" y="9" width="11" height="11" rx="2.2" /><path
			d="M5 15.5V5.5A1.5 1.5 0 0 1 6.5 4H15"
		/>
	{:else if name === 'chevleft'}
		<path d="M15 6l-6 6 6 6" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
	{:else if name === 'hourglass'}
		<path d="M6 3h12M6 21h12M6 3l6 9 6-9M6 21l6-9 6 9" />
	{/if}
</svg>
