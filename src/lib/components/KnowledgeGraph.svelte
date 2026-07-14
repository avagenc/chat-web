<script>
	/* Kanvas knowledge graph: D3 force-directed layout — pendekatan yang sama
	   dengan graph explorer Zep (getzep/zep-graph-visualization). D3 memiliki
	   DOM di dalam <svg> (dibangun ulang tiap data berubah); Svelte memegang
	   overlay HTML-nya: legend, kontrol zoom, dan kartu detail node/edge.
	   Interaksi: scroll/pinch zoom, drag pan, drag node, klik node/edge →
	   fokus (tetangga tetap terang, sisanya redup) + kartu detail. */
	import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
	import { select } from 'd3-selection';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { drag } from 'd3-drag';
	import 'd3-transition';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import Icon from './Icon.svelte';

	/** @typedef {import('$lib/stores/knowledge.svelte.js').KnowledgeNode} KnowledgeNode */
	/** @typedef {import('$lib/stores/knowledge.svelte.js').KnowledgeEdge} KnowledgeEdge */
	/** @type {{ nodes: KnowledgeNode[], edges: KnowledgeEdge[] }} */
	let { nodes, edges } = $props();

	/** @type {HTMLDivElement|null} */
	let host = $state(null);
	/** @type {SVGSVGElement|null} */
	let svgEl = $state(null);
	/** @type {{ kind: 'node', data: any } | { kind: 'edge', data: any } | null} */
	let selected = $state(null);
	/* handle ke scene D3 aktif (bukan state — hanya dipanggil dari handler) */
	/** @type {{ clearFocus: () => void, fitView: () => void, zoomBy: (f: number) => void } | null} */
	let scene = null;

	/* Hue keluarga agent (L≈0.60 C≈0.085) supaya graf sewarna dengan app;
	   label generik "Entity" dapat abu hangat netral. */
	const PALETTE = [
		'oklch(0.6 0.09 55)',
		'oklch(0.59 0.07 248)',
		'oklch(0.58 0.075 155)',
		'oklch(0.62 0.085 95)',
		'oklch(0.6 0.08 305)',
		'oklch(0.6 0.085 20)'
	];
	const ENTITY_COLOR = 'oklch(0.55 0.025 60)';

	/** Label utama node: label spesifik pertama; semua node Zep berlabel "Entity". @param {KnowledgeNode} n */
	const primaryLabel = (n) => (n.labels || []).find((l) => l !== 'Entity') || 'Entity';

	const labelInfo = $derived.by(() => {
		/** @type {Map<string, number>} */
		const counts = new SvelteMap();
		for (const n of nodes) {
			const l = primaryLabel(n);
			counts.set(l, (counts.get(l) || 0) + 1);
		}
		const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);
		/** @type {Map<string, string>} */
		const colors = new SvelteMap();
		let i = 0;
		for (const [label] of ordered) {
			colors.set(label, label === 'Entity' ? ENTITY_COLOR : PALETTE[i++ % PALETTE.length]);
		}
		return { colors, legend: ordered.slice(0, 6) };
	});

	const ID_MONTHS_SHORT = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'Mei',
		'Jun',
		'Jul',
		'Agu',
		'Sep',
		'Okt',
		'Nov',
		'Des'
	];
	/** "5 Jul 2026 · 14:03" @param {string|null|undefined} iso */
	function fmtDate(iso) {
		if (!iso) return '';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
		return `${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()} · ${hhmm}`;
	}

	$effect(() => {
		const colors = labelInfo.colors;
		const el = svgEl;
		const box = host;
		if (!el || !box || !nodes.length) return;
		selected = null;
		return build(el, box, nodes, edges, colors);
	});

	/**
	 * @param {SVGSVGElement} el
	 * @param {HTMLDivElement} box
	 * @param {KnowledgeNode[]} rawNodes
	 * @param {KnowledgeEdge[]} rawEdges
	 * @param {Map<string, string>} colors
	 */
	function build(el, box, rawNodes, rawEdges, colors) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const w = box.clientWidth || 800;
		const h = box.clientHeight || 600;

		/* d3-force memutasi node (x/y/vx/vy) & link (source/target → objek node)
		   tiap tick — beri salinan polos bertipe longgar, bukan proxy $state */
		/** @type {any[]} */
		const simNodes = rawNodes.map((n) => ({ ...n }));
		const byId = new Map(simNodes.map((n) => [n.uuid, n]));
		// edge yang ujungnya terpotong limit pagination tidak bisa digambar
		/** @type {any[]} */
		const simLinks = rawEdges
			.filter((e) => byId.has(e.source_node_uuid) && byId.has(e.target_node_uuid))
			.map((e) => ({ ...e, source: e.source_node_uuid, target: e.target_node_uuid }));

		/** @type {Map<string, number>} */
		const degree = new SvelteMap();
		for (const l of simLinks) {
			degree.set(l.source, (degree.get(l.source) || 0) + 1);
			degree.set(l.target, (degree.get(l.target) || 0) + 1);
		}
		/** @param {any} n */
		const radius = (n) => 6 + Math.min(9, (degree.get(n.uuid) || 0) * 1.2);
		/** @param {any} n */
		const color = (n) => colors.get(primaryLabel(n)) || ENTITY_COLOR;

		const svg = select(el);
		svg.selectAll('*').remove();
		const viewport = svg.append('g');
		const edgeLayer = viewport.append('g');
		const edgeLabelLayer = viewport.append('g').attr('class', 'kg-edge-labels').style('opacity', 0);
		const nodeLayer = viewport.append('g');

		const edgeG = edgeLayer.selectAll('g').data(simLinks).join('g').attr('class', 'kg-edge');
		const lines = edgeG
			.append('line')
			.attr('class', (d) => 'kg-edge-line' + (d.expired_at || d.invalid_at ? ' expired' : ''));
		// hit-area transparan yang lebar — garis 1px terlalu tipis untuk diklik
		const hits = edgeG
			.append('line')
			.attr('class', 'kg-edge-hit')
			.on('click', (/** @type {any} */ event, /** @type {any} */ d) => {
				event.stopPropagation();
				focusEdge(d);
			});

		const edgeLabels = edgeLabelLayer
			.selectAll('text')
			.data(simLinks)
			.join('text')
			.attr('class', 'kg-edge-label')
			.text((d) => d.name);

		const nodeG = nodeLayer
			.selectAll('g')
			.data(simNodes)
			.join('g')
			.attr('class', 'kg-node')
			.on('click', (/** @type {any} */ event, /** @type {any} */ d) => {
				if (event.defaultPrevented) return; // klik sisa gestur drag
				event.stopPropagation();
				focusNode(d);
			});
		nodeG
			.append('circle')
			.attr('r', radius)
			.style('fill', (d) => `color-mix(in srgb, ${color(d)} 30%, var(--surface))`)
			.style('stroke', (d) => color(d));
		nodeG
			.append('text')
			.attr('class', 'kg-node-label')
			.attr('dy', (d) => radius(d) + 13)
			.text((d) => (d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name));

		// ---- fokus / seleksi ----
		/** @param {any} d */
		function focusNode(d) {
			const near = new SvelteSet([d.uuid]);
			for (const l of simLinks) {
				if (l.source.uuid === d.uuid) near.add(l.target.uuid);
				if (l.target.uuid === d.uuid) near.add(l.source.uuid);
			}
			/** @param {any} l */
			const lit = (l) => l.source.uuid === d.uuid || l.target.uuid === d.uuid;
			nodeG.classed('dim', (n) => !near.has(n.uuid)).classed('focus', (n) => n.uuid === d.uuid);
			edgeG.classed('dim', (l) => !lit(l)).classed('lit', lit);
			edgeLabels.classed('dim', (l) => !lit(l));
			selected = { kind: 'node', data: d };
		}
		/** @param {any} d */
		function focusEdge(d) {
			const ends = new Set([d.source.uuid, d.target.uuid]);
			nodeG.classed('dim', (n) => !ends.has(n.uuid)).classed('focus', false);
			edgeG.classed('dim', (l) => l.uuid !== d.uuid).classed('lit', (l) => l.uuid === d.uuid);
			edgeLabels.classed('dim', (l) => l.uuid !== d.uuid);
			selected = { kind: 'edge', data: d };
		}
		function clearFocus() {
			nodeG.classed('dim', false).classed('focus', false);
			edgeG.classed('dim', false).classed('lit', false);
			edgeLabels.classed('dim', false);
			selected = null;
		}
		svg.on('click', clearFocus);

		// ---- zoom / pan ----
		const zoomer = zoom()
			.scaleExtent([0.15, 4])
			.on('zoom', (/** @type {any} */ event) => {
				viewport.attr('transform', event.transform);
				// nama relasi baru terbaca (dan layak tampil) saat cukup dekat
				edgeLabelLayer.style('opacity', event.transform.k >= 1.1 ? 1 : 0);
			});
		svg.call(/** @type {any} */ (zoomer)).on('dblclick.zoom', null);

		/** @param {boolean} animate */
		function fitView(animate) {
			let x0 = Infinity,
				x1 = -Infinity,
				y0 = Infinity,
				y1 = -Infinity;
			for (const n of simNodes) {
				x0 = Math.min(x0, n.x);
				x1 = Math.max(x1, n.x);
				y0 = Math.min(y0, n.y);
				y1 = Math.max(y1, n.y);
			}
			const pad = 70;
			const k = Math.min(1.6, 0.95 * Math.min(w / (x1 - x0 + pad * 2), h / (y1 - y0 + pad * 2)));
			const t = zoomIdentity
				.translate(w / 2, h / 2)
				.scale(k)
				.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
			const target = animate ? svg.transition().duration(420) : svg;
			/** @type {any} */ (target).call(zoomer.transform, t);
		}
		/** @param {number} f */
		function zoomBy(f) {
			const target = reduceMotion ? svg : svg.transition().duration(180);
			/** @type {any} */ (target).call(zoomer.scaleBy, f);
		}

		// ---- simulasi ----
		const simulation = forceSimulation(simNodes)
			.force(
				'link',
				forceLink(simLinks)
					.id((/** @type {any} */ d) => d.uuid)
					.distance(85)
					.strength(0.5)
			)
			.force('charge', forceManyBody().strength(-240))
			.force('center', forceCenter(w / 2, h / 2))
			.force(
				'collide',
				forceCollide().radius((/** @type {any} */ d) => radius(d) + 16)
			);

		function update() {
			lines
				.attr('x1', (d) => d.source.x)
				.attr('y1', (d) => d.source.y)
				.attr('x2', (d) => d.target.x)
				.attr('y2', (d) => d.target.y);
			hits
				.attr('x1', (d) => d.source.x)
				.attr('y1', (d) => d.source.y)
				.attr('x2', (d) => d.target.x)
				.attr('y2', (d) => d.target.y);
			edgeLabels
				.attr('x', (d) => (d.source.x + d.target.x) / 2)
				.attr('y', (d) => (d.source.y + d.target.y) / 2 - 4);
			nodeG.attr('transform', (d) => `translate(${d.x},${d.y})`);
		}

		/* Pra-tick sebelum render pertama supaya frame awal sudah tertata &
		   ter-fit; reduced-motion langsung settle penuh (layout statis, tanpa
		   goyangan — sejalan dengan fallback non-statis di Thinking). */
		simulation.stop();
		simulation.tick(reduceMotion ? 300 : 80);
		update();
		fitView(false);
		if (!reduceMotion) simulation.on('tick', update).restart();

		// ---- drag node ----
		const dragger = drag()
			.on('start', (/** @type {any} */ _event, /** @type {any} */ d) => {
				if (!reduceMotion) simulation.alphaTarget(0.25).restart();
				d.fx = d.x;
				d.fy = d.y;
			})
			.on('drag', (/** @type {any} */ event, /** @type {any} */ d) => {
				d.fx = event.x;
				d.fy = event.y;
				if (reduceMotion) {
					// simulasi diam: geser node + tepiannya langsung, tanpa re-layout
					d.x = event.x;
					d.y = event.y;
					update();
				}
			})
			.on('end', (/** @type {any} */ _event, /** @type {any} */ d) => {
				if (!reduceMotion) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			});
		nodeG.call(/** @type {any} */ (dragger));

		scene = { clearFocus, fitView: () => fitView(!reduceMotion), zoomBy };

		return () => {
			simulation.stop();
			svg.on('.zoom', null).on('click', null);
			svg.selectAll('*').remove();
			scene = null;
		};
	}
</script>

<div class="kg-canvas" bind:this={host}>
	<svg bind:this={svgEl} role="img" aria-label="Knowledge graph"></svg>

	{#if labelInfo.legend.length}
		<div class="kg-legend" aria-hidden="true">
			{#each labelInfo.legend as [label, count] (label)}
				<span class="kg-legend-item">
					<span class="kg-dot" style:background={labelInfo.colors.get(label)}></span>
					{label}
					<span class="kg-legend-count">{count}</span>
				</span>
			{/each}
		</div>
	{/if}

	<div class="kg-zoom">
		<button class="kg-zoom-btn" onclick={() => scene?.zoomBy(1.4)} aria-label="perbesar">
			<Icon name="plus" size={15} stroke={1.8} />
		</button>
		<button class="kg-zoom-btn" onclick={() => scene?.zoomBy(1 / 1.4)} aria-label="perkecil">
			<Icon name="minus" size={15} stroke={1.8} />
		</button>
		<button class="kg-zoom-btn" onclick={() => scene?.fitView()} aria-label="muat semua">
			<Icon name="frame" size={15} stroke={1.8} />
		</button>
	</div>

	{#if selected}
		<aside class="kg-detail">
			<div class="kg-detail-head">
				{#if selected.kind === 'node'}
					<span class="kg-dot" style:background={labelInfo.colors.get(primaryLabel(selected.data))}
					></span>
					<h4>{selected.data.name}</h4>
				{:else}
					<span class="kg-detail-kicker">Relasi</span>
					<h4>{selected.data.name}</h4>
				{/if}
				<button class="icon-btn sm" onclick={() => scene?.clearFocus()} aria-label="tutup detail">
					<Icon name="x" size={14} />
				</button>
			</div>
			{#if selected.kind === 'node'}
				{#if (selected.data.labels || []).filter((/** @type {string} */ l) => l !== 'Entity').length}
					<div class="kg-detail-labels">
						{#each selected.data.labels.filter((/** @type {string} */ l) => l !== 'Entity') as label (label)}
							<span class="kg-label-chip">{label}</span>
						{/each}
					</div>
				{/if}
				<p class="kg-detail-body">{selected.data.summary || 'Belum ada ringkasan.'}</p>
				<span class="kg-detail-meta">Dibuat {fmtDate(selected.data.created_at)}</span>
			{:else}
				<p class="kg-detail-body">{selected.data.fact}</p>
				<span class="kg-detail-meta">
					{#if selected.data.invalid_at}
						Tidak berlaku sejak {fmtDate(selected.data.invalid_at)}
					{:else if selected.data.valid_at}
						Berlaku sejak {fmtDate(selected.data.valid_at)}
					{:else}
						Dibuat {fmtDate(selected.data.created_at)}
					{/if}
				</span>
			{/if}
		</aside>
	{/if}
</div>
