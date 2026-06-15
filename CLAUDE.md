# CLAUDE.md

Avagenc Chat — antarmuka chat multi-agent (prototipe UI, balasan masih disimulasikan lokal).

## Stack

SvelteKit 5 (runes mode), Tailwind 4, `adapter-node`. Di-deploy ke Cloud Run via Docker (`build/index.js`, `PORT=8080`). UI berbahasa Indonesia.

## Perintah

Package manager: **Bun** (`bun.lock`; Dockerfile pakai `oven/bun`).

- `bun run dev` — dev server (Vite, biasanya port 5173)
- `bun run check` — `svelte-check` (type-check; **tidak** menangkap error runtime)
- `bun run format` / `bun run lint` — Prettier + ESLint
- `bun install` — pasang dependency

## Arsitektur

SPA murni: `src/routes/+layout.js` set `ssr = false`, jadi semua render terjadi di client. State persisten disimpan di `localStorage` lewat helper `persisted()` (`src/lib/persisted.svelte.js`); key: `avagenc.messages`, `avagenc.authed`, `avagenc.postera`.

File inti:

- `src/lib/agents.js` — definisi `AGENTS` (Ava=orkestrator+Spotify, Zee=Tuya smart home, Yori=Gmail, Rafal=Google Calendar), data `SEED` (percakapan awal) & `SEED_POSTERA`, helper waktu.
- `src/lib/orchestrator.js` — `planReply()`: router berbasis keyword yang mengembalikan urutan giliran balasan agent. Ini "seam" untuk diganti backend asli nanti.
- `src/lib/stores/conversation.svelte.js` — alur kirim/retry, indikator "thinking", dan migrasi data lama. Memanggil `planReply`.
- `src/lib/components/`, `src/lib/panels/` — komponen & panel UI.

Setiap agent punya variabel warna CSS `--<id>` di `src/app.css` (mis. `--ava`, `--rafal`).

## Catatan penting

- **Seed hanya dimuat saat `localStorage` kosong.** Mengubah `SEED` tidak akan terlihat di browser yang sudah pernah membuka app — perlu "Hapus riwayat chat" atau hapus key `avagenc.messages`.
- **Saat refactor agent:** komponen me-resolve agent via `AGENTS[msg.from]`. Pesan dari agent yang dihapus akan `undefined` → guard di UI (`{#if a}`) dan tambahkan migrasi di `conversation.svelte.js` agar tidak crash (layar putih). Lihat blok migrasi yang ada sebagai contoh.
