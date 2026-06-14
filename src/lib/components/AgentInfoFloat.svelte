<script>
	import { AGENTS } from '$lib/agents.js';
	import { portal } from '$lib/portal.js';
	import { registerPopup } from '$lib/popup.js';
	import Logo from './Logo.svelte';

	/** @type {{ agentId: string, anchor: Element, onClose: () => void }} */
	let { agentId, anchor, onClose } = $props();
	const a = $derived(/** @type {Record<string, any>} */ (AGENTS)[agentId]);

	/** @type {HTMLElement|null} */
	let pop = $state(null);
	let pos = $state({ top: -9999, left: -9999 });

	$effect(() => {
		if (anchor) {
			const rect = anchor.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const popW = 256;
			const popH = 140;
			let left = rect.right + 10;
			if (left + popW > vw - 10) left = rect.left - popW - 10;
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

{#if a}
	<div
		bind:this={pop}
		class="agent-info-float"
		use:portal
		style="top:{pos.top}px;left:{pos.left}px"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<div class="aif-head">
			<span class="agent-av aif-av" style:--agent={a.varc}>
				<Logo size={15} variant="cream" />
			</span>
			<div class="aif-meta">
				<div class="aif-name">{a.name}</div>
				<div class="aif-role">{a.role}</div>
			</div>
		</div>
		<p class="aif-desc">{a.desc}</p>
	</div>
{/if}
