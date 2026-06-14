<script>
	import { AGENTS } from '$lib/agents.js';

	/** @type {{ agent: string }} */
	let { agent } = $props();
	const a = $derived(AGENTS[agent]);
</script>

<div class="row agent thinking" style:--agent={a.varc}>
	<div class="byline">
		<span class="name">{a.name}</span>
		<span class="role">· {a.role}</span>
	</div>
	<div class="bubble-wrap">
		<div class="avatar-slot"></div>
		<div class="bubble">
			<span class="dot" style:--agent={a.varc}></span>
			<span class="dot" style:--agent={a.varc}></span>
			<span class="dot" style:--agent={a.varc}></span>
		</div>
	</div>
</div>
