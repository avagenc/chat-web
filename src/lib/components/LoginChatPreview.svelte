<script>
	import { onMount } from 'svelte';
	import { AGENTS, nowTime } from '$lib/agents.js';
	import Message from './Message.svelte';
	import Thinking from './Thinking.svelte';
	import Icon from './Icon.svelte';

	// Percakapan demo yang diputar terus di kartu preview login. Ini murni
	// tampilan (kartu di-`pointer-events:none`, `aria-hidden`), jadi tak ada
	// interaksi asli — cuma "iklan hidup" produk.
	const SCRIPT = [
		{ kind: 'human', from: 'human', text: 'musik!' },
		{ kind: 'agent', from: 'ava', text: 'siap, mau yang calm atau gimana nih musiknya' },
		{ kind: 'human', from: 'human', text: 'bebas' },
		{ kind: 'agent', from: 'ava', text: '@yori putar lagu favorit human belakangan ini' },
		{
			kind: 'agent',
			from: 'yori',
			text: 'siap! aku lihat, belakang ini human sering denger Never is Enough dari Iann Dior, udah aku putar ya'
		},
		{
			kind: 'human',
			from: 'human',
			text: '@rafal ada email penting hari ini? ada event terjadwal hari gak? setahu saya gak ada'
		},
		{
			kind: 'agent',
			from: 'rafal',
			text: 'betul, gak ada, aku lihat hanya ada email email tidak penting, gak ada event juga hari ini'
		},
		{
			kind: 'human',
			from: 'human',
			text: 'oke, bisa nyantai berarti hari ini. tolong bukain gorden sedikit'
		},
		{ kind: 'agent', from: 'ava', text: '@zee' },
		{ kind: 'agent', from: 'zee', text: 'udah aku buka seperempat ya!!' },
		{
			kind: 'agent',
			from: 'ava',
			text: 'oh iya, jam 1:30 nanti kamu harus makan dan minum obat, nanti aku ingatin, selamat bersantai, human!'
		}
	];

	/** @typedef {import('$lib/agents.js').Message} Msg */
	/** @type {Msg[]} */
	let messages = $state([]);
	let thinking = $state(false);
	let typingText = $state('');
	/** @type {HTMLElement | undefined} */
	let scroller;

	let alive = true;
	let msgId = 0;

	// Mirror @mention seperti composer asli: token @agent jadi <mark>.
	// (lihat mirrorTokens di Composer.svelte)
	/** @param {string} val */
	function mirrorTokens(val) {
		return val.split(/(@\w+)/g).map((part) => {
			if (/^@\w+$/.test(part)) {
				const id = part.slice(1).toLowerCase();
				return { kind: AGENTS[id] ? 'mention' : 'partial', value: part };
			}
			return { kind: 'text', value: part };
		});
	}
	const tokens = $derived(mirrorTokens(typingText));

	/** @param {number} ms */
	const delay = (ms) => new Promise((r) => setTimeout(r, ms));

	function scrollDown() {
		requestAnimationFrame(() => {
			if (scroller) scroller.scrollTop = scroller.scrollHeight;
		});
	}

	/** @param {number} i */
	const groupedAt = (i) =>
		i > 0 && messages[i - 1].from === messages[i].from && messages[i - 1].status === undefined;

	/** @param {string} t @param {number} speed */
	async function typeInto(t, speed) {
		typingText = '';
		for (let i = 0; i < t.length; i++) {
			if (!alive) return;
			typingText += t[i];
			await delay(speed + Math.random() * 18);
		}
	}

	/** @param {string} text */
	async function human(text) {
		await typeInto(text, text.length > 30 ? 24 : 46);
		if (!alive) return;
		await delay(320);
		const id = `pv-${++msgId}`;
		messages = [
			...messages,
			{ id, from: 'human', type: 'text', text, time: nowTime(), status: 'sending' }
		];
		typingText = '';
		scrollDown();
		await delay(560);
		if (!alive) return;
		messages = messages.map((m) => (m.id === id ? { ...m, status: undefined } : m));
	}

	/** @param {string} from @param {string} text */
	async function agent(from, text) {
		thinking = true;
		scrollDown();
		await delay(950 + Math.random() * 650);
		if (!alive) return;
		thinking = false;
		messages = [...messages, { id: `pv-${++msgId}`, from, type: 'text', text, time: nowTime() }];
		scrollDown();
		await delay(500);
	}

	async function play() {
		while (alive) {
			messages = [];
			thinking = false;
			typingText = '';
			await delay(700);
			for (const step of SCRIPT) {
				if (!alive) return;
				if (step.kind === 'human') await human(step.text);
				else await agent(step.from, step.text);
				if (!alive) return;
				await delay(650);
			}
			// tahan di akhir sebelum mengulang
			await delay(4200);
		}
	}

	const noop = () => {};

	onMount(() => {
		const reduced =
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			// Tanpa animasi: tampilkan percakapan penuh secara statis.
			messages = SCRIPT.map((s) => ({
				id: `pv-${++msgId}`,
				from: s.from,
				type: 'text',
				text: s.text,
				time: nowTime()
			}));
			scrollDown();
		} else {
			play();
		}
		return () => {
			alive = false;
		};
	});
</script>

<div class="login-preview" aria-hidden="true">
	<div class="preview-frame">
		<div class="preview-scroll" bind:this={scroller}>
			<div class="preview-thread">
				<div class="daydivider">Hari ini</div>
				{#each messages as msg, i (msg.id)}
					<Message {msg} grouped={groupedAt(i)} onOpenImage={noop} onRetry={noop} />
				{/each}
				{#if thinking}
					<Thinking />
				{/if}
			</div>
		</div>
		<div class="preview-composer">
			<div class="inputbar" class:typing={typingText}>
				<div class="inputbar-mirror-wrap">
					<div class="ta-mirror">
						{#if typingText}{#each tokens as t, i (i)}{#if t.kind === 'mention'}<mark
										class="ta-mention">{t.value}</mark
									>{:else if t.kind === 'partial'}<mark class="ta-mention-partial">{t.value}</mark
									>{:else}{t.value}{/if}{/each}<span class="preview-caret"></span>{:else}<span
								class="preview-ph">Ketik pesan…</span
							>{/if}
					</div>
				</div>

				<div class="send-btn" class:sb-idle={!typingText}><Icon name="send" size={18} /></div>
			</div>
		</div>
	</div>
</div>

<style>
	.login-preview {
		/* Sepenuhnya non-interaktif — murni pajangan. */
		pointer-events: none;
		user-select: none;
		flex: none;
		width: min(468px, 100%);
	}

	/* Komposisi dua kolom butuh lebar; di layar sempit sembunyikan kartu
	   agar login kembali ke tata letak satu kolom seperti semula. */
	@media (max-width: 880px) {
		.login-preview {
			display: none;
		}
	}

	.preview-frame {
		position: relative;
		height: min(78vh, 648px);
		display: flex;
		flex-direction: column;
		/* --bg seperti kanvas chat asli (halaman login-nya yang --surface). */
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.preview-scroll {
		flex: 1;
		overflow: hidden;
		padding: 0 18px;
		scrollbar-width: none;
	}
	.preview-scroll::-webkit-scrollbar {
		display: none;
	}

	.preview-thread {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 18px 0 22px;
		min-height: 100%;
	}

	/* Composer preview = composer asli. Kelas .inputbar/.compose-btn/.send-btn/
	   .ta-mirror/mark.ta-mention berasal dari app.css global; di sini cuma
	   penyesuaian untuk mode statis (tanpa textarea) + border saat "mengetik". */
	.preview-composer {
		flex: none;
		padding: 12px 14px 14px;
	}
	.inputbar.typing {
		border-color: var(--accent);
	}
	/* Tanpa textarea, buat mirror mengalir agar tinggi bar tumbuh mengikuti teks. */
	.ta-mirror {
		position: relative;
	}
	.preview-ph {
		color: var(--ink-faint);
	}
	/* send button "nonaktif" saat belum ada ketikan — meniru composer asli */
	.send-btn.sb-idle {
		background: var(--bg-sunk);
		color: var(--ink-faint);
	}
	/* caret blok seperti kursor teks asli */
	.preview-caret {
		display: inline-block;
		width: 1.5px;
		height: 1.05em;
		vertical-align: -0.18em;
		margin-left: 1px;
		background: var(--ink);
		animation: tw-blink 0.85s step-end infinite;
	}
</style>
