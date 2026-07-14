/* Knowledge graph: memori semantik user dari backend — GET /knowledge
   mengembalikan `{nodes, edges}` (entity node + entity edge Zep). Dimuat
   lazy saat modal Knowledge Graph dibuka, bukan saat login — graf bisa
   besar dan jarang dilihat. 404 = user belum punya graf (belum pernah
   ngobrol / baru di-reset): bukan error, tampil sebagai kosong. */
import { SvelteMap } from 'svelte/reactivity';
import { api, ApiError } from '../api.js';
import { nowTime } from '../agents.js';

/* Zep meng-cap tiap halaman di 50 item apa pun limit yang diminta, jadi graf
   harus ditarik berhalaman sampai habis: nodes & edges adalah dua daftar
   independen dengan cursor masing-masing (`node_cursor`/`edge_cursor`,
   UUID item terakhir halaman sebelumnya). Halaman dianggap habis saat tidak
   menyumbang item baru — guard ini juga membuat loop berhenti wajar di
   backend lama yang belum mengenal cursor terpisah (halaman berulang). */
const PAGE_LIMIT = 50;
const MAX_PAGES = 40;

/**
 * @typedef {{ uuid: string, name: string, summary: string, labels?: string[],
 *   created_at: string, attributes?: Record<string, any> }} KnowledgeNode
 * @typedef {{ uuid: string, name: string, fact: string, source_node_uuid: string,
 *   target_node_uuid: string, created_at: string, valid_at?: string|null,
 *   invalid_at?: string|null, expired_at?: string|null, episodes?: string[],
 *   attributes?: Record<string, any> }} KnowledgeEdge
 */

/** @type {KnowledgeNode[]} */
let nodes = $state([]);
/** @type {KnowledgeEdge[]} */
let edges = $state([]);
let loading = $state(false);
/** true setelah fetch pertama sukses — pembeda "belum dimuat" vs "kosong" */
let loaded = $state(false);
let error = $state(false);
/** @type {string|null} jam "HH:MM" fetch terakhir yang sukses */
let lastFetched = $state(null);

/** Tarik seluruh graf, halaman demi halaman, sampai kedua daftar habis. */
async function fetchAll() {
	/** @type {Map<string, KnowledgeNode>} */
	const nodeById = new SvelteMap();
	/** @type {Map<string, KnowledgeEdge>} */
	const edgeById = new SvelteMap();
	/** @type {string|null} */
	let nodeCursor = null;
	/** @type {string|null} */
	let edgeCursor = null;
	let nodesDone = false;
	let edgesDone = false;
	for (let page = 0; page < MAX_PAGES && !(nodesDone && edgesDone); page++) {
		let params = `limit=${PAGE_LIMIT}`;
		if (nodeCursor) params += `&node_cursor=${encodeURIComponent(nodeCursor)}`;
		if (edgeCursor) params += `&edge_cursor=${encodeURIComponent(edgeCursor)}`;
		/** @type {{ nodes: KnowledgeNode[]|null, edges: KnowledgeEdge[]|null } | null} */
		const graph = await api(`/knowledge?${params}`);
		const pageNodes = graph?.nodes ?? [];
		const pageEdges = graph?.edges ?? [];
		let newNodes = 0;
		for (const n of pageNodes) {
			if (!nodeById.has(n.uuid)) {
				nodeById.set(n.uuid, n);
				newNodes++;
			}
		}
		let newEdges = 0;
		for (const e of pageEdges) {
			if (!edgeById.has(e.uuid)) {
				edgeById.set(e.uuid, e);
				newEdges++;
			}
		}
		nodesDone ||= newNodes === 0;
		edgesDone ||= newEdges === 0;
		if (pageNodes.length) nodeCursor = pageNodes[pageNodes.length - 1].uuid;
		if (pageEdges.length) edgeCursor = pageEdges[pageEdges.length - 1].uuid;
	}
	return { nodes: [...nodeById.values()], edges: [...edgeById.values()] };
}

export const knowledgeStore = {
	get nodes() {
		return nodes;
	},
	get edges() {
		return edges;
	},
	get loading() {
		return loading;
	},
	get loaded() {
		return loaded;
	},
	get error() {
		return error;
	},
	get lastFetched() {
		return lastFetched;
	},

	async load() {
		if (loading) return;
		loading = true;
		error = false;
		try {
			const graph = await fetchAll();
			nodes = graph.nodes;
			edges = graph.edges;
			loaded = true;
			lastFetched = nowTime();
		} catch (e) {
			if (e instanceof ApiError && e.status === 404) {
				// belum ada graf di Zep — state kosong yang sah, bukan kegagalan
				nodes = [];
				edges = [];
				loaded = true;
				lastFetched = nowTime();
			} else {
				error = true;
			}
		} finally {
			loading = false;
		}
	},

	reset() {
		nodes = [];
		edges = [];
		loading = false;
		loaded = false;
		error = false;
		lastFetched = null;
	}
};
