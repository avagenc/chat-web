/* Knowledge graph: memori semantik user dari backend — GET /knowledge
   mengembalikan `{nodes, edges}` (entity node + entity edge Zep). Dimuat
   lazy saat modal Knowledge Graph dibuka, bukan saat login — graf bisa
   besar dan jarang dilihat. 404 = user belum punya graf (belum pernah
   ngobrol / baru di-reset): bukan error, tampil sebagai kosong. */
import { api, ApiError } from '../api.js';
import { nowTime } from '../agents.js';

/* Satu tarikan besar tanpa cursor: handler backend memakai query yang sama
   untuk nodes dan edges, jadi pagination dua daftar dengan satu cursor tidak
   koheren — untuk graf personal, limit longgar sekali jalan sudah cukup. */
const GRAPH_LIMIT = 500;

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
			/** @type {{ nodes: KnowledgeNode[]|null, edges: KnowledgeEdge[]|null } | null} */
			const graph = await api(`/knowledge?limit=${GRAPH_LIMIT}`);
			nodes = graph?.nodes ?? [];
			edges = graph?.edges ?? [];
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
