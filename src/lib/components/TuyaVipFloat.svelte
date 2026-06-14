<script>
	import { portal } from '$lib/portal.js';
	import { registerPopup } from '$lib/popup.js';
	import Icon from './Icon.svelte';

	/** @type {{ anchor: Element, onClose: () => void }} */
	let { anchor, onClose } = $props();

	/** @type {HTMLElement|null} */
	let pop = $state(null);
	let pos = $state({ top: -9999, left: -9999 });

	$effect(() => {
		if (anchor) {
			const rect = anchor.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const popW = 272;
			const popH = 148;
			let left = rect.right + 12;
			if (left + popW > vw - 10) left = rect.left - popW - 12;
			left = Math.max(10, Math.min(left, vw - popW - 10));
			let top = rect.top + rect.height / 2 - popH / 2;
			top = Math.max(10, Math.min(top, vh - popH - 10));
			pos = { top, left };
		}

		const unregister = registerPopup(onClose);
		/** @param {MouseEvent} e */
		const outsideClick = (e) => {
			if (pop && !pop.contains(/** @type {Node} */ (e.target))) onClose();
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		const onScroll = () => onClose();
		const tid = setTimeout(() => window.addEventListener('click', outsideClick), 10);
		window.addEventListener('keydown', onKey);
		window.addEventListener('scroll', onScroll, true);
		return () => {
			unregister();
			clearTimeout(tid);
			window.removeEventListener('click', outsideClick);
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('scroll', onScroll, true);
		};
	});
</script>

<div
	bind:this={pop}
	class="vip-float"
	use:portal
	style="top:{pos.top}px;left:{pos.left}px"
	onclick={(e) => e.stopPropagation()}
	role="presentation"
>
	<div class="vip-float-head">
		<span class="vip-badge">VIP</span>
		<span class="vip-float-title">Koneksi Manual Diperlukan</span>
	</div>
	<p class="vip-float-body">
		Tuya Smart adalah layanan VIP. Koneksi tidak bisa dilakukan otomatis — hubungi tim Avagenc untuk
		mengaktifkan integrasi ini.
	</p>
	<a class="vip-float-mail" href="mailto:support@avagenc.com" onclick={onClose}>
		<Icon name="send" size={14} /> support@avagenc.com
	</a>
</div>
