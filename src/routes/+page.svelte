<script>
	import { session } from '$lib/stores/session.svelte.js';
	import { conversation } from '$lib/stores/conversation.svelte.js';
	import { posteraStore } from '$lib/stores/postera.svelte.js';
	import { USER } from '$lib/agents.js';

	import Login from '$lib/components/Login.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Message from '$lib/components/Message.svelte';
	import Thinking from '$lib/components/Thinking.svelte';
	import Composer from '$lib/components/Composer.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import UsageWidget from '$lib/components/UsageWidget.svelte';
	import ChatInfoPage from '$lib/panels/ChatInfoPage.svelte';
	import ProfilePanel from '$lib/panels/ProfilePanel.svelte';
	import PosteraPanel from '$lib/panels/PosteraPanel.svelte';

	/** @type {HTMLElement|null} */
	let canvas = $state(null);
	/** @type {HTMLInputElement|null} */
	let searchInput = $state(null);

	// ---- search matches ----
	const q = $derived(session.search.active ? session.search.query.trim() : '');
	const matches = $derived(
		q
			? conversation.messages
					.filter((m) => (m.text || m.caption || '').toLowerCase().includes(q.toLowerCase()))
					.map((m) => m.id)
			: []
	);
	const clampedIdx = $derived(
		matches.length ? Math.min(session.search.idx, matches.length - 1) : 0
	);
	const activeId = $derived(matches.length ? matches[clampedIdx] : null);

	// autoscroll on new message / thinking change (not while searching)
	$effect(() => {
		// re-run whenever the message list or thinking indicator changes
		const dep = [conversation.messages.length, conversation.thinking];
		if (session.search.active || !dep) return;
		const el = canvas;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTop = el.scrollHeight;
		});
	});

	// scroll active search match to centre (no scrollIntoView)
	$effect(() => {
		const id = activeId;
		if (id == null) return;
		const c = canvas;
		if (!c) return;
		const el = /** @type {HTMLElement|null} */ (c.querySelector(`[data-mid="${id}"]`));
		if (!el) return;
		const eR = el.getBoundingClientRect();
		const cR = c.getBoundingClientRect();
		c.scrollTop = Math.max(
			0,
			c.scrollTop + (eR.top - cR.top) - c.clientHeight / 2 + el.offsetHeight / 2
		);
	});

	// focus the search input when it opens
	$effect(() => {
		if (session.search.active && searchInput) searchInput.focus();
	});

	function nextMatch() {
		if (matches.length)
			session.search = { ...session.search, idx: (clampedIdx + 1) % matches.length };
	}
	function prevMatch() {
		if (matches.length)
			session.search = {
				...session.search,
				idx: (clampedIdx - 1 + matches.length) % matches.length
			};
	}

	function clearChat() {
		conversation.clear();
		session.panel = null;
		session.view = 'chat';
		session.flashToast('Riwayat chat dihapus');
	}
	function clearKnowledge() {
		session.panel = null;
		session.flashToast('Knowledge dihapus');
	}
	/** @param {number} id */
	function cancelPosterum(id) {
		posteraStore.cancel(id);
		session.flashToast('Posterum dibatalkan');
	}

	/** @param {number} i */
	const grouped = (i) => {
		const prev = conversation.messages[i - 1];
		return !!prev && prev.from === conversation.messages[i].from && prev.status === undefined;
	};
</script>

{#if !session.authed}
	<Login onLogin={() => session.login()} />
{:else}
	<div
		class={'app' +
			(session.panel === 'profile' ? ' left-open' : '') +
			(session.panel === 'postera' ? ' right-open' : '')}
	>
		<div class="top-fade" aria-hidden="true"></div>

		<!-- top-left: Avagenc Chat / ← Kembali ke chat -->
		{#if !session.search.active}
			{#if session.view === 'info'}
				<button
					class="wordmark-float wf-back"
					onclick={() => {
						session.view = 'chat';
						session.panel = null;
					}}
					aria-label="Kembali ke chat"
				>
					<Icon name="chevleft" size={16} />
					<span class="wf-name">Kembali ke chat</span>
				</button>
			{:else}
				<button
					class="wordmark-float"
					onclick={() => {
						session.view = 'info';
						session.panel = null;
					}}
					aria-label="Info Avagenc"
				>
					<Logo size={17} variant="ink" />
					<span class="wf-name">Avagenc</span>
					<span class="wf-chat">Chat</span>
				</button>
			{/if}
		{/if}

		<!-- top-right: postera -->
		{#if !session.search.active && session.panel !== 'postera'}
			<button
				class="fixed-settings"
				onclick={() => (session.panel = 'postera')}
				aria-label="Postera Ava"
			>
				<Icon name="hourglass" size={17} stroke={1.7} />
				{#if posteraStore.list.length > 0}
					<span class="postera-badge">{posteraStore.list.length}</span>
				{/if}
			</button>
		{/if}

		<!-- usage widget -->
		{#if !session.search.active && session.panel !== 'profile'}
			<UsageWidget onOpenProfile={() => (session.panel = 'profile')} />
		{/if}

		<!-- bottom-left: profile -->
		{#if !session.search.active}
			<button
				class="avatar-btn fixed-profile"
				onclick={() => session.togglePanel('profile')}
				aria-label="profil"
			>
				<span class="mini-avatar">{USER.initial}</span>
				<span class="profile-tip">
					<span class="pt-name">{USER.name}</span>
					<span class="pt-email">{USER.email}</span>
				</span>
			</button>
		{/if}

		<!-- floating search bar -->
		{#if session.search.active}
			<div class="search-float">
				<span class="s-ic"><Icon name="search" size={18} /></span>
				<input
					bind:this={searchInput}
					class="s-input"
					placeholder="Cari di chat…"
					value={session.search.query}
					oninput={(e) =>
						(session.search = { ...session.search, query: e.currentTarget.value, idx: 0 })}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							if (e.shiftKey) prevMatch();
							else nextMatch();
						}
						if (e.key === 'Escape') session.closeSearch();
					}}
				/>
				<span class="s-count"
					>{q ? `${matches.length ? clampedIdx + 1 : 0}/${matches.length}` : ''}</span
				>
				<div class="s-nav">
					<button
						class="icon-btn sm"
						disabled={!matches.length}
						onclick={prevMatch}
						aria-label="sebelumnya"><Icon name="up" size={18} /></button
					>
					<button
						class="icon-btn sm"
						disabled={!matches.length}
						onclick={nextMatch}
						aria-label="berikutnya"><Icon name="down" size={18} /></button
					>
				</div>
				<button class="s-done" onclick={() => session.closeSearch()}>Selesai</button>
			</div>
		{/if}

		<!-- main area -->
		{#if session.view === 'chat'}
			<main class="canvas" bind:this={canvas}>
				{#if conversation.empty}
					<div class="center" style="display:flex;flex-direction:column;flex:1;min-height:100%">
						<div class="empty">
							<div class="mark"><Logo size={26} variant="accent" /></div>
							<h2>Hello, Human. We have been longing to serve you! What do you need?</h2>
							<p>SIlahkan coba mulai percakapan dengan contoh pesan berikut:</p>
							<div class="suggest">
								<button class="chip" onclick={() => conversation.sendText('Kenalan dong!')}
									>Kenalan dong!</button
								>
								<button
									class="chip"
									onclick={() => conversation.sendText('Avagenc Chat nih apa ya?')}
									>Avagenc Chat nih apa ya?</button
								>
								<button
									class="chip"
									onclick={() => conversation.sendText('Kamu bisa bantu apa aja?')}
									>Kamu bisa bantu apa aja?</button
								>
							</div>
						</div>
					</div>
				{:else}
					<div class="center canvas-inner">
						<div class="daydivider">Hari ini</div>
						{#each conversation.messages as msg, i (msg.id)}
							<Message
								{msg}
								grouped={grouped(i)}
								onOpenImage={(src) => (session.lightbox = src)}
								onRetry={(id) => conversation.retry(id)}
								query={q}
								activeMatch={msg.id === activeId}
							/>
						{/each}
						{#if conversation.thinking}
							<Thinking agent={conversation.thinking.agent} />
						{/if}
					</div>
				{/if}
			</main>

			{#if !session.search.active}
				<Composer
					onSendText={(t) => conversation.sendText(t)}
					onSendImage={(src, caption) => conversation.sendImage(src, caption)}
				/>
			{/if}
		{:else}
			<main class="canvas info-view">
				<ChatInfoPage
					onSearch={() => session.openSearch()}
					onClearChat={clearChat}
					onClearKnowledge={clearKnowledge}
				/>
			</main>
		{/if}

		<!-- side-docks -->
		{#if session.panel === 'profile'}
			<ProfilePanel onClose={() => (session.panel = null)} onLogout={() => session.logout()} />
		{/if}
		{#if session.panel === 'postera'}
			<PosteraPanel
				postera={posteraStore.list}
				onCancel={cancelPosterum}
				onClose={() => (session.panel = null)}
			/>
		{/if}

		{#if session.lightbox}
			<Lightbox src={session.lightbox} onClose={() => (session.lightbox = null)} />
		{/if}
		{#if session.toast}
			<div class="toast"><Icon name="check" size={15} />{session.toast}</div>
		{/if}
	</div>
{/if}
