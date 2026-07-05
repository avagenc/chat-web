/* Wallet: saldo + pemakaian hari ini dari backend.
   GET /wallet → { balance } (rupiah, truncate); GET /wallet/usage/today →
   { tokens, cost } (butuh header time-zone — sudah selalu dikirim api()).
   Di-refresh saat login, saat user menekan refresh di kartu pemakaian, dan
   setelah tiap giliran agent selesai (biaya baru saja bertambah). */
import { api } from '../api.js';
import { nowTime } from '../agents.js';

/** @type {number|null} */
let balance = $state(null);
/** @type {number|null} */
let todayTokens = $state(null);
/** @type {number|null} */
let todayCost = $state(null);
/** @type {string|null} jam "HH:MM" refresh terakhir yang sukses */
let lastUpdated = $state(null);
let refreshing = $state(false);

/** @param {number|null} n */
function rupiah(n) {
	if (n === null) return '—';
	return 'Rp ' + n.toLocaleString('id-ID');
}

export const wallet = {
	get balance() {
		return balance;
	},
	get todayTokens() {
		return todayTokens;
	},
	get todayCost() {
		return todayCost;
	},
	get lastUpdated() {
		return lastUpdated;
	},
	get balanceLabel() {
		return rupiah(balance);
	},
	get todayCostLabel() {
		return rupiah(todayCost);
	},
	get todayTokensLabel() {
		return todayTokens === null ? '—' : todayTokens.toLocaleString('id-ID');
	},

	async refresh() {
		if (refreshing) return;
		refreshing = true;
		try {
			const [bal, usage] = await Promise.all([api('/wallet'), api('/wallet/usage/today')]);
			balance = bal?.balance ?? null;
			todayTokens = usage?.tokens ?? null;
			todayCost = usage?.cost ?? null;
			lastUpdated = nowTime();
		} finally {
			refreshing = false;
		}
	},

	reset() {
		balance = null;
		todayTokens = null;
		todayCost = null;
		lastUpdated = null;
	}
};
