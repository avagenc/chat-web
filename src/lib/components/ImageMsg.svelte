<script>
	import MentionText from './MentionText.svelte';

	/** @type {{ msg: import('$lib/agents.js').Message, onOpen: (src: string) => void, query?: string }} */
	let { msg, onOpen, query = '' } = $props();
</script>

<div>
	<div
		class="img-msg"
		role="button"
		tabindex="0"
		onclick={() => onOpen(msg.src ?? '')}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onOpen(msg.src ?? '');
			}
		}}
	>
		<img src={msg.src} alt="lampiran" />
	</div>
	{#if msg.caption}
		<div class="img-caption"><MentionText text={msg.caption} {query} /></div>
	{/if}
</div>
