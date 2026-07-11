// Callback OAuth per-integrasi: parameter route (`gworkspace`|`spotify`) tidak
// bisa dienumerasi saat build, dan halamannya murni dinamis (baca query, panggil
// API), jadi tidak diprerender — di-render client seperti sisa SPA (ssr=false
// diwarisi dari root layout).
export const prerender = false;
