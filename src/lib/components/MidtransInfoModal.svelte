<script>
	import { portal } from '$lib/portal.js';
	import Icon from './Icon.svelte';

	/** @type {{ onClose: () => void }} */
	let { onClose } = $props();

	$effect(() => {
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="confirm-scrim" use:portal onclick={onClose} role="presentation">
	<div class="confirm-sheet" onclick={(e) => e.stopPropagation()} role="presentation">
		<div class="ic"><Icon name="spark" size={20} /></div>
		<div class="q">Integrasi Midtrans</div>
		<div class="sub">
			Tepat di sini kami berencana menggunakan Midtrans, untuk memungkinkan pengguna mengisi saldo
			token Avagenc.
		</div>
		<div class="confirm-actions">
			<button class="btn-soft" onclick={onClose}>Tutup</button>
		</div>
	</div>
</div>
