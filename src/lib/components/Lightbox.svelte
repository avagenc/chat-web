<script>
	import Icon from './Icon.svelte';
	import { portal } from '$lib/portal.js';

	/** @type {{ src: string, onClose: () => void }} */
	let { src, onClose } = $props();

	$effect(() => {
		/** @param {KeyboardEvent} e */
		const k = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', k);
		return () => window.removeEventListener('keydown', k);
	});
</script>

<div class="lightbox" use:portal onclick={onClose} role="presentation">
	<button class="close" onclick={onClose} aria-label="tutup"><Icon name="x" /></button>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<img {src} alt="pratinjau" onclick={(e) => e.stopPropagation()} />
</div>
