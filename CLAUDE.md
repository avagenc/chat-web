# CLAUDE.md

Avagenc Chat — antarmuka chat multi-agent. Terhubung ke backend asli
(repo `avagenc/chat`, `cmd/http`): auth Firebase, balasan agent dari
POST `/ava`, riwayat dari memori episodik `/sessions`, wallet, postera,
knowledge, dan linking OAuth (Google Workspace & Spotify). Yang masih stub:
pembayaran top-up (Midtrans) dan Tuya (linking manual "VIP").

> **Catatan buat sesi Claude lain:** halaman legal `/legal` (Privasi +
> Ketentuan dalam satu halaman) menampilkan produk sebagai layanan nyata demi
> review OAuth Google — **jangan tambahkan bahasa prototipe/simulasi ke sana.**

## Stack

SvelteKit 5 (runes mode), Tailwind 4, `adapter-node`. Di-deploy ke Cloud Run via Docker (`build/index.js`, `PORT=8080`). UI berbahasa Indonesia.

## Perintah

Package manager: **Bun** (`bun.lock`; Dockerfile pakai `oven/bun`).

- `bun run dev` — dev server (Vite, biasanya port 5173)
- `bun run check` — `svelte-check` (type-check; **tidak** menangkap error runtime)
- `bun run format` / `bun run lint` — Prettier + ESLint
- `bun install` — pasang dependency

## Arsitektur

SPA murni: `src/routes/+layout.js` set `ssr = false`, semua render di client.
Data hidup di backend — **tidak ada lagi state chat di `localStorage`**
(helper `persisted()` sudah dihapus). Base URL backend dari env
`PUBLIC_API_BASE` (`.env` / `env.example`).

File inti:

- `src/lib/api.js` — klien HTTP: `Authorization: Bearer <Firebase ID token>` +
  header `time-zone` di semua request; error backend →
  `ApiError {status, detail}`. Sesi TIDAK dikirim dari FE: backend
  single-session, menurunkan `chat-<uid>` sendiri dari token di semua entry
  point (auto-create thread Zep), jadi riwayat otomatis nyambung lintas device.
- `src/lib/firebase.js` — auth Google (lazy-init, dynamic import).
- `src/lib/agents.js` — definisi `AGENTS` (Ava=orkestrator murni, Zee=Tuya
  smart home, Yori=musik/Spotify, Rafal=Gmail+Kontak+Kalender via Google
  Workspace), `SOON_AGENTS` (teaser), helper waktu.
- `src/lib/stores/conversation.svelte.js` — sumber kebenaran pesan = thread
  backend (`GET /sessions/messages`). Kirim = `POST` ke endpoint agent
  tujuan: `routeAgent(text)` (di `agents.js`) memilih dari himpunan unik
  `@mention` yang dikenal — tanpa mention → `/ava`; tepat satu agent → langsung
  ke endpoint-nya (`/zee`,`/yori`,`/rafal`) tanpa lewat Ava; lebih dari satu
  agent berbeda → `/ava` biar Ava yang orkestrasi (perintah lintas-specialist
  butuh koordinasi). Selama menunggu, thread di-poll (~2.2s) supaya giliran
  delegasi/specialist muncul live. Pesan human baru dirender optimistis
  (`local-*`, status `sending`) sampai muncul di thread server. Balasan agent
  boleh kosong (Ava delegasi lalu diam) — backend balas 200 body kosong dan
  pesan kosong tidak dipersist ke thread.
- `src/lib/stores/wallet.svelte.js` — saldo (`GET /wallet`) + pemakaian hari
  ini (`GET /wallet/usage/today`); di-refresh setelah tiap giliran agent.
- `src/lib/stores/postera.svelte.js` — `GET /postera`, batal `DELETE
/postera/{id}`.
- `src/lib/stores/session.svelte.js` — auth gate + `profile` (nama/email dari
  akun Google); saat login memicu load semua store, saat logout me-reset-nya.
- `src/routes/[integration]/link/callback/+page.svelte` — halaman callback OAuth
  per-integrasi (Google Workspace & Spotify); integrasi dari route param
  (`page.params.integration`), bukan dari `state` (token HMAC backend, tetap
  opaque di FE), lalu `POST /{integration}/connection`. Backend menurunkan
  redirect URI tiap integrasi dari env `WEB_APP_URL` — tiap URL
  (`WEB_APP_URL/{integration}/link/callback`) harus terdaftar verbatim di
  provider. Route ini `prerender=false` (`+page.js`).
- `src/lib/components/`, `src/lib/panels/` — komponen & panel UI.

Setiap agent punya variabel warna CSS `--<id>` di `src/app.css` (mis. `--ava`, `--rafal`).

## Catatan penting

- **Pemetaan pesan thread → UI** (`toUiMessage` di `conversation.svelte.js`):
  role `system` di-skip (pesan wake-up postera untuk Ava); role `user` dengan
  `name` agent = giliran delegasi Ava (tampil sebagai pesan Ava, mis. `@zee …`);
  role `assistant` → `from` = `name`. `name` di luar `AGENTS` jatuh ke
  human/ava — guard `{#if a}` di UI tetap perlu.
- **Saat refactor agent:** komponen me-resolve agent via `AGENTS[msg.from]`;
  pesan dari agent yang tidak dikenal dipetakan ke Ava oleh `toUiMessage`,
  jadi tidak crash — tapi pastikan roster `AGENTS` sinkron dengan backend.
- **402 dari backend = saldo habis** — `sendText` menandai pesan `error` +
  `errorNote:'saldo'`; wallet & top-up yang jadi jalur pulihnya (pembayaran
  masih stub Midtrans).
- **ID pesan** = UUID Zep (string); pesan optimistis pakai prefix `local-`.
  Jangan kembali ke counter angka.

---

# Referensi Desain / UI

> Bagian ini gabungan dari `CLAUDEDESIGN.md` (handoff desain asli). Handoff itu
> dikirim sebagai prototipe React di folder `reference/` yang **sudah dihapus** —
> isinya sudah jadi app SvelteKit sekarang (login, chat, panel, dst). Jadi bagian
> ini dipakai sebagai **spec visual & perilaku** (design tokens = source of truth
> nilai visual), bukan instruksi port lagi. Roster agent di bawah sudah
> disesuaikan ke kode aktual (Ava=orkestrator murni / Zee=Tuya / Yori=musik
> Spotify / Rafal=Gmail+Kontak+Kalender); handoff lama sempat menyebut
> "Niko" dan pembagian lain — abaikan, kode yang menang. Perilaku simulasi
> di handoff (planReply, voice note, image message) sudah diganti backend
> asli / dihapus.

## Konsep produk

Chat mobile-first di mana user ("Human") ngobrol dengan **Ava**, AI orkestrator,
yang mendelegasikan tugas ke tim agent spesialis yang membalas di thread yang sama
— gaya group-chat. Estetika: UI "kertas" hangat krem, tipografi serif untuk isi
pesan, satu aksen terracotta, hairline border alih-alih shadow. Semua copy Bahasa
Indonesia. Permukaan produk: login Google, kanvas chat (pesan teks dengan
@mention), delegasi agent in-thread, pencarian pesan, panel profil/billing
(pemakaian token harian, top-up, integrasi pihak ketiga), halaman chat-info, dan
**Postera** — pesan yang Ava jadwalkan untuk dirinya sendiri di masa depan.

Fidelity: hi-fi. Warna, tipografi, spacing, radii, motion, dan interaction state
sudah final — jangan "diperbaiki" tanpa alasan.

## Design tokens (source of truth; lihat `:root` di `src/app.css`)

```css
/* surfaces — hangat, tidak pernah putih murni */
--bg: #faf6ec;
--bg-sunk: #f4eee0;
--surface: #fefcf6;
--surface-2: #fbf7ee;
/* ink — hitam kecokelatan, tidak pernah #000 */
--ink: #2c231c;
--ink-soft: #3a2e24;
--ink-muted: rgba(44, 35, 28, 0.52);
--ink-faint: rgba(44, 35, 28, 0.34);
--ink-ghost: rgba(44, 35, 28, 0.16);
/* hairlines (dipakai menggantikan shadow) */
--line: rgba(44, 35, 28, 0.11);
--line-strong: rgba(44, 35, 28, 0.17);
/* accent — satu terracotta muted */
--accent: #b5734a;
--accent-deep: #8e5733;
--accent-tint: rgba(181, 115, 74, 0.13);
--accent-tint-strong: rgba(181, 115, 74, 0.2);
/* agent hues — L≈0.60 C≈0.085, cuma beda hue */
--ava: oklch(0.6 0.09 55); /* terracotta */
--zee: oklch(0.62 0.085 95); /* warm amber */
--yori: oklch(0.58 0.075 155); /* muted sage */
--rafal: oklch(0.59 0.07 248); /* slate clay */
/* radii / layout */
--radius: 16px;
--radius-sm: 10px;
--maxw: 720px;
/* type */
--serif: 'Newsreader', Georgia, serif;
--sans: 'Inter Tight', system-ui, sans-serif;
/* motion */
--ease: cubic-bezier(0.22, 0.61, 0.36, 1);
```

Theming per-agent pakai custom property inline: `style:--agent={a.varc}` (idiom
Svelte). Setiap agent punya `--<id>` (`--ava`, `--zee`, `--yori`, `--rafal`).

**Tipografi.** Newsreader (opsz 6–72, w400/500/600) untuk isi pesan, heading,
brand, angka besar; Inter Tight (400/450/500/600) untuk UI/label/meta. Ukuran
kunci: bubble 17px; byline name 12.5px/600; timestamp 11px; composer 15.5px;
empty greeting 27px serif/400; login hook 38px serif/400; panel header 21px
serif/500; usage big stat 27px serif/500; section group-label 11px/600 uppercase
`letter-spacing:.06em`.

**Spacing & bentuk.** Kolom kanvas max 720px; padding samping 24px (16px mobile).
Gap antar pesan 18px; gap dalam row 4px. Side-dock `min(400px,90vw)`. Radius
bubble 16px (pointer corner disquare jadi 6px). Pill 999px. Card/list 14–16px.
Input/button 10–13px. **Pakai hairline border, bukan box-shadow**, untuk pemisah;
shadow hanya pada overlay sejati (float, lightbox, side-dock) — halus & hangat.

**Ikon.** Semua inline SVG 24×24 stroke (`stroke:currentColor`, `stroke-width:1.7`,
round cap/join) via `Icon.svelte` (prop `name`). Tidak perlu library ikon.

## Layar / view

Routing "layar" pakai state (`authed`, `panel`, `view`), **bukan URL** — chat
adalah satu `+page.svelte`. (Kekecualian: `/legal` route statis untuk review
OAuth, dan `/link/callback/[integration]` halaman callback OAuth linking.)

1. **Login** (`.login-v2`): sign-in Google via popup Firebase. Brand lockup
   kiri-atas, hook block terpusat, `.btn-google` (max 340px) di dalam kartu
   announce, live chat preview di kanan (≥880px). Hook dua baris: baris 1
   serif 38px statis, baris 2 typewriter di `--accent`.
2. **Kanvas chat**: thread utama. Pesan Human rata kanan (bubble `--accent-tint`);
   pesan agent rata kiri dengan byline nama saja — tanpa avatar bulat
   (bubble `--surface`+`--line`).
   Shell `.app` flex column fixed-height `overflow:hidden`, grain kertas via
   `.app::before`. Panel kiri/kanan adalah **side-dock** (bukan overlay, tanpa
   scrim) yang mendorong kanvas via `--panel-left`/`--panel-right`, transisi 0.30s.
   Chrome mengambang (tanpa top bar): `.wordmark-float` kiri-atas (buka chat-info),
   `.fixed-settings` kanan-atas (hourglass → Postera, ada badge kalau count>0),
   `.fixed-profile` kiri-bawah (avatar → Profile), `.usage-widget` pill "Rp",
   `.top-fade` gradien atas. Kanvas: kolom scroll `max-width:720px`, `.daydivider`
   di atas. Empty state: mark aksen + greeting serif 27px + 3 `.chip` suggestion.
   Autoscroll: `scrollTop = scrollHeight` via rAF (bukan `scrollIntoView`).
3. **Message row** (`.row`): entrance `rise` (8px/0.42s). Byline agent = nama
   ber-warna `--agent` + "· role" (klik → `AgentInfoFloat`). **Grouping**: kalau
   pengirim sama & tidak error → sembunyikan byline, square-kan
   pointer corner. **Tiny variant** kalau teks cuma `@mention` (mis. `@zee`) → pill
   w500. Klik bubble → `BubbleChatInfo` (timestamp + "Salin teks"). `@mention` &
   highlight search di-render `MentionText` (split `/(@\w+)/g`). Status: `sending`
   → "Mengirim…", `error` → ikon + "Gagal terkirim." (atau "Saldo tidak cukup…"
   saat 402) + "Coba lagi".
4. **Composer** (`.composer-wrap`/`.inputbar`): fixed bawah, inset mengikuti lebar
   panel. Pill `--surface`, border → `--accent` on focus-within. Textarea
   auto-grow (max 132px) di atas **mirror div** yang me-render highlight @mention
   live — mengetik TETAP bisa selama busy (busy = menunggu balasan orkestrasi).
   Kanan: tombol send (disabled saat kosong); saat busy tombol berubah jadi
   **stop** (`Icon name="stop"`) → `conversation.cancelTurn()` (abort POST agent
   in-flight — cukup putus HTTP, tanpa jaminan rollback server). **Autocomplete
   @mention**: ketik `@`+partial → `.mention-popup`, `↑/↓` pindah, `Tab`/`Enter`
   accept, `Esc` tutup. (Voice note & attach image sudah dihapus — backend hanya
   menerima teks.)
5. **Thinking** (`.thinking`): indikator processing UMUM, satu untuk semua agent
   (bukan per-agent — orkestrasi terjadi di server): mark Avagenc telanjang
   ukuran tetap — ink dengan sapuan kilau putih melintasi glyph (`.mark-sweep`,
   mask SVG + keyframes `glow-sweep`; reduced-motion = pulse opacity pelan
   `mark-pulse`, bukan statis — indikator loading itu status esensial) +
   status whimsical polos yang berganti tiap ~2.4s (`.thinking-status`, daftar
   `STATUSES` di `Thinking.svelte`) — sengaja TANPA lingkaran avatar dan TANPA
   bubble chat. Muncul selama `POST /ava` in-flight.
6. **Chat-info page** (`.info-page-inner`): identity block, scroller chip agent
   (aktif + teaser "Soon"; tap → `.agent-detail`), row "Cari di chat", grup
   "Kelola" dengan **satu** row destruktif **Reset chat & knowledge** →
   `DELETE /knowledge` (Zep `User.Delete`: menghapus user beserta seluruh
   thread-nya, jadi riwayat chat + knowledge ludes sekaligus), di-gate
   `ActionConfirm`. Episodik & semantik terikat di Zep, jadi disatukan jadi satu
   aksi — bukan dua tombol yang seakan bisa dipisah.
7. **Profile panel** (`.sheet.sheet-left`): account card dari akun Google login
   (avatar inisial + badge "G", email pill). **Usage card**: header "Hari ini"
   dengan jam "Diperbarui HH:MM" dan tombol refresh; satu angka besar biaya
   hari ini rata kanan (`.usage-hero .big`) dengan keterangan "terpakai hari
   ini untuk N token" di bawahnya; footer saldo + tombol **Isi ulang**.
   **Integrasi** (`.set-list`), tiap row menampilkan nama agent terkait (dot +
   nama ber-hue agent + "· role"): **Google Workspace** (satu tombol connect
   untuk Gmail+Kontak+Kalender, brand tile = tumpukan 3 logo, agent Rafal),
   **Spotify** (agent Yori), **Tuya Smart** (agent Zee). Tombol OAuth
   (gworkspace/spotify): "Hubungkan" → `GET /{i}/auth-url` lalu redirect ke
   consent; "Terhubung" → confirm → `DELETE /{i}/connection`. **Tuya** di-link
   manual (VIP, tanpa OAuth) tapi statusnya tetap dicek: **Terhubung** (badge
   non-interaktif) kalau `GET /tuya/connection` `{connected:true}`, selain itu
   chip **VIP** → `TuyaVipFloat`. Status semua integrasi + saldo/pemakaian
   di-refresh tiap panel dibuka (panel mount ulang tiap kali). Footer:
   **Keluar** → `ActionConfirm`.
8. **Top-up modal** (`.topup-modal`): balance card (saldo asli dari wallet),
   4 preset chip (50k/100k/200k/500k), input Rp custom (min Rp 10.000),
   summary, 4 bullet peringatan, tombol lanjut → placeholder Midtrans.
   Provider bayar = **stub**.
9. **Postera panel** (`.sheet` kanan): header "Postera" + refresh
   (`posteraStore.load()`) + close, jam "Diperbarui HH:MM". List posterum
   accordion: pill `awaken_at` (hue Ava; "HH:MM" hari ini, "5 Jul · HH:MM"
   selain itu), preview, chevron; expanded ada tombol "Batalkan posterum"
   (→ `ActionConfirm` → `DELETE /postera/{id}`). Empty state kalau kosong.

## Interaksi & perilaku

- **Send text** (`sendText`): append pesan human optimistis (`local-*`,
  `status:"sending"`), tampilkan `Thinking` (indikator umum),
  `POST {agent.endpoint} {message}` (tujuan dari `routeAgent`). POST agent
  di belakang kunci single-flight (`postAgentTurn`) — tidak boleh ada dua
  POST agent bersamaan dari klien; `cancelTurn()` meng-abort POST in-flight
  (AbortController via `api({signal})`), lalu rekonsiliasi sekali ke thread. Tanpa mention (atau >1 agent berbeda
  di-mention) → Ava (`/ava`) yang berorkestrasi; tepat satu agent di-mention →
  langsung ke endpoint agent itu. Selama in-flight, thread di-poll tiap ~2.2s (`GET /sessions/messages`)
  supaya giliran delegasi (`@zee …`) & balasan specialist muncul live —
  orkestrasi sesungguhnya terjadi di backend (Ava + sub-agent ADK). Setelah
  POST selesai: sinkronisasi final thread, lalu refresh wallet.
- **Retry**: hanya untuk pesan optimistis yang `error`. Backend mempersist
  pesan human ke thread di **awal** run, jadi POST yang gagal di sisi client
  (timeout/putus jaringan/error tengah orkestrasi) bisa terjadi setelah pesan
  tercatat — karena itu error handler `runTurn` maupun `retry` **rekonsiliasi
  dulu ke thread server** sebelum menandai error / re-POST: kalau pesan sudah
  mendarat (dicek via `pendingBaseline`, himpunan id server saat kirim), tidak
  ada re-POST — mengirim ulang berarti pesan dobel & agent terpicu dua kali.
  Error non-`ApiError` (jaringan) dengan pesan sudah mendarat → poller
  dibiarkan hidup ~90s (orkestrasi mungkin masih jalan di server). 402 →
  `errorNote:'saldo'` (copy khusus di `.msg-meta`).
- **Search**: buka search sembunyikan composer/chrome; `matches` = id pesan yang
  teks/caption-nya memuat query (case-insensitive); `↑/↓`/Enter cycle; match aktif
  scroll ke tengah + `.active-match`.
- **Reset chat & knowledge** (`conversation.clear()`) → `DELETE /knowledge`
  (Zep `User.Delete` = hapus thread + graph sekaligus) + toast (404 = sudah
  kosong, tetap sukses); backend bikin ulang thread kosong saat pesan berikut.
  **Cancel posterum** → `DELETE /postera/{id}` + toast. **Toast**: pill
  bawah-tengah, auto ~2200ms.
- **Logout** → signOut Firebase; store conversation/postera/wallet di-reset.

**Motion (port persis).** Easing global `--ease`. `rise` (enter row/float 8px/0.42s),
`fade` (overlay), `slidein`/`slidein-left` (side-dock 0.30s), `glow-sweep` (thinking),
`tw-blink` (caret typewriter), `spin-refresh` (refresh Postera). Push panel di
`.canvas`/`.composer-wrap`/`.top-fade` = 0.30s. Hormati `prefers-reduced-motion`.

**Responsif.** Mobile-first sampai ~360px. Side-dock cap `90vw`. Di bawah 640px
padding kiri composer nambah biar tidak ketutup tombol profil. Layar lebar = kolom
720px terpusat (tidak ada layout desktop terpisah).

## State yang dimodelkan

Global (module/store level):

- `authed`/`ready`/`user`/`profile` — dari Firebase Auth (`session.svelte.js`)
- `messages` — dari thread backend + pesan optimistis; `{ id, from, type:'text',
text, time, at?, status?, errorNote? }`
- `thinking: boolean` (indikator processing umum), `busy`, `loaded`
- `panel: 'profile' | 'postera' | null`
- `view: 'chat' | 'info'`
- `lightbox: src | null`, `toast: string | null`
- `search: { active, query, idx }`
- `postera` — `{ id, message, awaken_at }` dari `GET /postera`
- wallet — `balance`, `todayTokens`, `todayCost`, `lastUpdated`
- `openFloat` — satu float aktif ("one popup at a time"; setel = ganti yang lama).

Derived: `matches`, `clampedIdx`, `activeId`, `empty`, plus per-row `grouped`/`tiny`
dan `canSend`/`suggestions` composer. Float (`AgentInfoFloat`, `BubbleChatInfo`,
`TuyaVipFloat`, dst) dirender di root `+page.svelte` (fixed-position), hitung posisi
dari `getBoundingClientRect()` anchor.

## Aset

- `avagenc-ink.svg` / `avagenc-accent.svg` / `avagenc-cream.svg` — logo Avagenc tiga
  fill (`Logo` pilih via prop `variant`): ink=lockup brand, accent=mark empty-state,
  cream=di dalam avatar berwarna.
- **Google "G"** digambar inline (4-warna resmi) hanya untuk affordance auth Google
  — bukan bagian palet brand Avagenc.
- Brand tile integrasi (`Brand`: gmail/contacts/calendar/spotify/tuya) = logo
  webp di `/static`; Google Workspace dirender sebagai tumpukan 3 tile
  (`.brand-stack`).
