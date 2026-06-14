<script>
	import { AGENTS } from '$lib/agents.js';
	import Logo from './Logo.svelte';

	/** @type {{ agent: string }} */
	let { agent } = $props();
	const a = $derived(AGENTS[agent]);
</script>

{#if a}
	<div class="avatar" style:--agent={a.varc}>
		<Logo size={13} variant="cream" />
	</div>
{/if}
