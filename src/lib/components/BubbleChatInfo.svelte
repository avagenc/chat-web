<script>
	import { fullStamp } from '$lib/agents.js';
	import { portal } from '$lib/portal.js';
	import { registerPopup } from '$lib/popup.js';
	import Icon from './Icon.svelte';

	/** @type {{ msg: import('$lib/agents.js').Message, anchor: Element, isHuman: boolean, onClose: () => void }} */
	let { msg, anchor, isHuman, onClose } = $props();

	/** @type {HTMLElement|null} */
	let pop = $state(null);
	let pos = $state({ top: -9999, left: -9999 });
	let copied = $state(false);
	const copyText = $derived(msg.text || msg.caption || '');

	$effect(() => {
		if (anchor) {
			const rect = anchor.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const popW = 230;
			const popH = copyText ? 88 : 46;
			let left;
			if (isHuman) {
				left = rect.left - popW - 10;
				if (left < 10) left = rect.right + 10;
			} else {
				left = rect.right + 10;
				if (left + popW > vw - 10) left = rect.left - popW - 10;
			}
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

	/** @param {Event} e */
	function handleCopy(e) {
		e.stopPropagation();
		const done = () => {
			copied = true;
			setTimeout(() => {
				copied = false;
				onClose();
			}, 1100);
		};
		try {
			navigator.clipboard.writeText(copyText).then(done, done);
		} catch {
			done();
		}
	}
</script>

<div
	bind:this={pop}
	class="bubble-menu-float"
	use:portal
	style="top:{pos.top}px;left:{pos.left}px"
	onclick={(e) => e.stopPropagation()}
	role="presentation"
>
	<div class="bm-time"><Icon name="clock" size={13} /> {fullStamp(msg.time)}</div>
	{#if copyText}
		<button class="bm-copy" onclick={handleCopy}>
			<Icon name={copied ? 'check' : 'copy'} size={14} />
			{copied ? 'Teks tersalin' : 'Salin teks'}
		</button>
	{/if}
</div>
