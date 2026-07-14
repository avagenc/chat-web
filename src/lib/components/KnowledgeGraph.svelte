<script>
	/* Kanvas knowledge graph: D3 force-directed layout — pendekatan yang sama
	   dengan graph explorer Zep (getzep/zep-graph-visualization). D3 memiliki
	   DOM di dalam <svg> (dibangun ulang tiap data berubah); Svelte memegang
	   overlay HTML-nya: legend, kontrol zoom, dan kartu detail node/edge.

	   Perilaku meniru explorer Zep:
	   - gravitasi ke pusat (forceX/forceY) → hairball kompak, node yatim
	     mengambang di tepiannya, bukan terlempar jauh;
	   - ukuran node ∝ √degree — hub besar, daun kecil;
	   - edge paralel (banyak fact antara pasangan node yang sama) digambar
	     sebagai arc melengkung dengan offset bertingkat, bukan garis bertumpuk;
	   - label node hanya untuk hub (semua label muncul saat zoom cukup dekat,
	     atau saat node di-hover/dipilih);
	   - hover node/edge menyalakan yang bersangkutan; klik → fokus: sisanya
	     diredupkan kuat, edge terpilih menyala + nama relasinya tampil. */
	import {
		forceSimulation,
		forceLink,
		forceManyBody,
		forceX,
		forceY,
		forceCollide
	} from 'd3-force';
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
		// edge tanpa kedua ujung (data terpotong) atau self-loop tidak digambar
		/** @type {any[]} */
		const simLinks = rawEdges
			.filter(
				(e) =>
					byId.has(e.source_node_uuid) &&
					byId.has(e.target_node_uuid) &&
					e.source_node_uuid !== e.target_node_uuid
			)
			.map((e) => ({ ...e, source: e.source_node_uuid, target: e.target_node_uuid }));

		/** @type {Map<string, number>} */
		const degree = new SvelteMap();
		for (const l of simLinks) {
			degree.set(l.source, (degree.get(l.source) || 0) + 1);
			degree.set(l.target, (degree.get(l.target) || 0) + 1);
		}
		/** @param {any} n */
		const deg = (n) => degree.get(n.uuid) || 0;
		/** @param {any} n */
		const radius = (n) => 4 + Math.min(20, 2.3 * Math.sqrt(deg(n)));
		/** @param {any} n */
		const color = (n) => colors.get(primaryLabel(n)) || ENTITY_COLOR;

		/* Edge paralel: kelompokkan per pasangan node (tanpa arah), tiap edge
		   dapat offset lengkung bertingkat di dua sisi garis — gaya arc Zep. */
		/** @type {Map<string, any[]>} */
		const pairs = new SvelteMap();
		for (const l of simLinks) {
			const key = l.source < l.target ? `${l.source}|${l.target}` : `${l.target}|${l.source}`;
			let list = pairs.get(key);
			if (!list) {
				list = [];
				pairs.set(key, list);
			}
			list.push(l);
		}
		for (const list of pairs.values()) {
			const m = list.length;
			list.forEach((l, i) => {
				let curve = m === 1 ? 0 : i - (m - 1) / 2;
				// jaga sisi lengkung konsisten walau arah edge berlawanan
				if (l.source > l.target) curve = -curve;
				l.curve = curve;
			});
		}

		/* Label node default hanya untuk hub — di graf kecil semua kebaca,
		   jadi tampilkan semua; sisanya muncul saat zoom/hover/fokus. */
		const topDegrees = simNodes.map(deg).sort((a, b) => b - a);
		const hubCut = simNodes.length <= 25 ? 1 : Math.max(3, topDegrees[7] ?? 3);

		const svg = select(el);
		const hostSel = select(box);
		svg.selectAll('*').remove();
		const viewport = svg.append('g');
		const edgeLayer = viewport.append('g');
		const edgeLabelLayer = viewport.append('g');
		const nodeLayer = viewport.append('g');

		/** @param {any} d */
		function edgePath(d) {
			const x1 = d.source.x,
				y1 = d.source.y,
				x2 = d.target.x,
				y2 = d.target.y;
			if (!d.curve) return `M${x1},${y1}L${x2},${y2}`;
			const dx = x2 - x1,
				dy = y2 - y1,
				len = Math.hypot(dx, dy) || 1;
			const off = d.curve * Math.min(52, 14 + len * 0.14);
			const cx = (x1 + x2) / 2 + (-dy / len) * off;
			const cy = (y1 + y2) / 2 + (dx / len) * off;
			return `M${x1},${y1}Q${cx},${cy} ${x2},${y2}`;
		}
		/** Titik tengah kurva (t=0.5 pada Bezier kuadratik). @param {any} d */
		function labelPoint(d) {
			const x1 = d.source.x,
				y1 = d.source.y,
				x2 = d.target.x,
				y2 = d.target.y;
			if (!d.curve) return [(x1 + x2) / 2, (y1 + y2) / 2];
			const dx = x2 - x1,
				dy = y2 - y1,
				len = Math.hypot(dx, dy) || 1;
			const off = d.curve * Math.min(52, 14 + len * 0.14);
			const cx = (x1 + x2) / 2 + (-dy / len) * off;
			const cy = (y1 + y2) / 2 + (dx / len) * off;
			return [(x1 + 2 * cx + x2) / 4, (y1 + 2 * cy + y2) / 4];
		}

		const edgeG = edgeLayer.selectAll('g').data(simLinks).join('g').attr('class', 'kg-edge');
		const lines = edgeG
			.append('path')
			.attr('class', (d) => 'kg-edge-line' + (d.expired_at || d.invalid_at ? ' expired' : ''));
		// hit-area transparan yang lebar — garis 1px terlalu tipis untuk pointer
		const hits = edgeG
			.append('path')
			.attr('class', 'kg-edge-hit')
			.on('pointerenter', (/** @type {any} */ _event, /** @type {any} */ d) => {
				if (sel) return; // ada seleksi → hover tidak merebut highlight
				edgeG.classed('lit', (l) => l === d);
				edgeLabels.classed('lit', (l) => l === d);
			})
			.on('pointerleave', () => {
				if (sel) return;
				edgeG.classed('lit', false);
				edgeLabels.classed('lit', false);
			})
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
			.classed('labeled', (d) => deg(d) >= hubCut)
			.on('pointerenter', (/** @type {any} */ _event, /** @type {any} */ d) => {
				nodeG.classed('hover', (n) => n === d);
				if (sel) return;
				/** @param {any} l */
				const lit = (l) => l.source === d || l.target === d;
				edgeG.classed('lit', lit);
				edgeLabels.classed('lit', lit);
			})
			.on('pointerleave', () => {
				nodeG.classed('hover', false);
				if (sel) return;
				edgeG.classed('lit', false);
				edgeLabels.classed('lit', false);
			})
			.on('click', (/** @type {any} */ event, /** @type {any} */ d) => {
				if (event.defaultPrevented) return; // klik sisa gestur drag
				event.stopPropagation();
				focusNode(d);
			});
		nodeG
			.append('circle')
			.attr('r', radius)
			.style('fill', (d) => `color-mix(in srgb, ${color(d)} 42%, var(--surface))`)
			.style('stroke', (d) => color(d));
		nodeG
			.append('text')
			.attr('class', 'kg-node-label')
			.attr('dy', (d) => radius(d) + 12)
			.text((d) => (d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name));

		// ---- fokus / seleksi ----
		/** @type {any} seleksi aktif di scene ini (cermin dari state `selected`) */
		let sel = null;
		/** @param {any} d */
		function focusNode(d) {
			sel = d;
			const near = new SvelteSet([d.uuid]);
			for (const l of simLinks) {
				if (l.source.uuid === d.uuid) near.add(l.target.uuid);
				if (l.target.uuid === d.uuid) near.add(l.source.uuid);
			}
			/** @param {any} l */
			const lit = (l) => l.source.uuid === d.uuid || l.target.uuid === d.uuid;
			nodeG
				.classed('dim', (n) => !near.has(n.uuid))
				.classed('focus', (n) => n.uuid === d.uuid)
				.classed('endpoint', false);
			edgeG.classed('dim', (l) => !lit(l)).classed('lit', lit);
			edgeG.filter(lit).raise();
			edgeLabels.classed('dim', (l) => !lit(l)).classed('lit', false);
			selected = { kind: 'node', data: d };
		}
		/** @param {any} d */
		function focusEdge(d) {
			sel = d;
			const ends = new SvelteSet([d.source.uuid, d.target.uuid]);
			nodeG
				.classed('dim', (n) => !ends.has(n.uuid))
				.classed('focus', false)
				.classed('endpoint', (n) => ends.has(n.uuid));
			edgeG.classed('dim', (l) => l.uuid !== d.uuid).classed('lit', (l) => l.uuid === d.uuid);
			edgeG.filter((l) => l.uuid === d.uuid).raise();
			edgeLabels.classed('dim', (l) => l.uuid !== d.uuid).classed('lit', (l) => l.uuid === d.uuid);
			selected = { kind: 'edge', data: d };
		}
		function clearFocus() {
			sel = null;
			nodeG.classed('dim', false).classed('focus', false).classed('endpoint', false);
			edgeG.classed('dim', false).classed('lit', false);
			edgeLabels.classed('dim', false).classed('lit', false);
			selected = null;
		}
		svg.on('click', clearFocus);

		// ---- zoom / pan ----
		const zoomer = zoom()
			.scaleExtent([0.15, 5])
			.on('zoom', (/** @type {any} */ event) => {
				viewport.attr('transform', event.transform);
				// cukup dekat → semua label node kebaca; lebih dekat lagi → nama relasi
				hostSel
					.classed('zoomed', event.transform.k >= 1.5)
					.classed('zoomed-in', event.transform.k >= 2.2);
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
			const pad = 60;
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
		/* Gaya gravitasi (forceX/forceY) alih-alih forceCenter: forceCenter cuma
		   menggeser rata-rata posisi, komponen yang tak terhubung tetap terbang
		   menjauh — gravitasi menarik semuanya ke pusat jadi hairball kompak
		   seperti explorer Zep, node yatim mengambang di tepiannya. */
		const simulation = forceSimulation(simNodes)
			.force(
				'link',
				forceLink(simLinks)
					.id((/** @type {any} */ d) => d.uuid)
					.distance(70)
			)
			.force('charge', forceManyBody().strength(-120))
			.force('x', forceX(w / 2).strength(0.07))
			.force('y', forceY(h / 2).strength(0.07))
			.force(
				'collide',
				forceCollide().radius((/** @type {any} */ d) => radius(d) + 4)
			);

		function update() {
			lines.attr('d', edgePath);
			hits.attr('d', edgePath);
			edgeLabels.attr('x', (d) => labelPoint(d)[0]).attr('y', (d) => labelPoint(d)[1] - 4);
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
			hostSel.classed('zoomed', false).classed('zoomed-in', false);
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
