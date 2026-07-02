# CLAUDE.md

Avagenc Chat — antarmuka chat multi-agent (prototipe UI, balasan masih disimulasikan lokal).

> **Catatan buat sesi Claude lain:** sifat "prototipe/simulasi" di atas soal
> keadaan kode, bukan cara produk dipresentasikan ke publik. Halaman legal
> `/legal` (Privasi + Ketentuan dalam satu halaman) sengaja menampilkan produk
> sebagai layanan nyata demi review OAuth Google — **jangan tambahkan bahasa
> prototipe/simulasi ke sana.**
> Lihat `TODO.md` (bagian Status) untuk konteksnya.

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
- **ID pesan harus unik & monoton — jangan andalkan counter di module saja.** `nextId()` (`agents.js`) cuma counter module (`__id`) yang reset ke nilai awal tiap reload, padahal `id` pesan ikut disimpan di `localStorage`. Kalau counter tidak di-seed, sesudah refresh `nextId()` mulai dari angka rendah lagi → id baru bentrok dengan pesan lama → key duplikat di `{#each conversation.messages as msg (msg.id)}` (`+page.svelte`) bikin Svelte throw → tombol kirim "mati". Karena itu `conversation.svelte.js` memanggil `seedId(maxIdYangAda)` setelah store dimuat (sesudah blok migrasi). Jangan hapus pemanggilan ini, dan kalau bikin sumber id baru pastikan tetap monoton di atas seluruh id yang sudah dipersist. Catatan: bug ini hanya muncul saat ada riwayat lalu di-refresh — bukan saat fresh/baru clear (store kosong, jadi belum ada yang bentrok).

---

# Referensi Desain / UI

> Bagian ini gabungan dari `CLAUDEDESIGN.md` (handoff desain asli). Handoff itu
> dikirim sebagai prototipe React di folder `reference/` yang **sudah dihapus** —
> isinya sudah jadi app SvelteKit sekarang (login, chat, panel, dst). Jadi bagian
> ini dipakai sebagai **spec visual & perilaku** (design tokens = source of truth
> nilai visual), bukan instruksi port lagi. Roster agent di bawah sudah
> disesuaikan ke kode aktual (Ava / Zee / Yori=Gmail / Rafal=Calendar); handoff
> lama sempat menyebut agent "Niko/Yori-musik" — abaikan, kode yang menang.

## Konsep produk

Chat mobile-first di mana user ("Human") ngobrol dengan **Ava**, AI orkestrator,
yang mendelegasikan tugas ke tim agent spesialis yang membalas di thread yang sama
— gaya group-chat. Estetika: UI "kertas" hangat krem, tipografi serif untuk isi
pesan, satu aksen terracotta, hairline border alih-alih shadow. Semua copy Bahasa
Indonesia. Permukaan produk: login gaya Google, kanvas chat (pesan teks/voice/image
dengan @mention), delegasi agent in-thread, pencarian pesan, panel profil/billing
(token pay-as-you-go, top-up, integrasi pihak ketiga), halaman chat-info, dan
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
adalah satu `+page.svelte`. (Kekecualian: `/legal` yang memang route statis;
lihat `TODO.md`.)

1. **Login** (`.login-v2`): sign-in Google satu-tap (mock — cuma flip `authed`).
   Brand lockup kiri-atas, hook block terpusat, `.btn-google` (max 340px). Hook
   dua baris: baris 1 serif 38px statis, baris 2 typewriter di `--accent`.
2. **Kanvas chat**: thread utama. Pesan Human rata kanan (bubble `--accent-tint`);
   pesan agent rata kiri dengan byline + avatar (bubble `--surface`+`--line`).
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
   pengirim sama & tidak error → sembunyikan byline + avatar (spacer), square-kan
   pointer corner. **Tiny variant** kalau teks cuma `@mention` (mis. `@zee`) → pill
   w500. Klik bubble → `BubbleChatInfo` (timestamp + "Salin teks"). `@mention` &
   highlight search di-render `MentionText` (split `/(@\w+)/g`). Status: `sending`
   → "Mengirim…", `error` → ikon + "Gagal terkirim." + "Coba lagi".
4. **Composer** (`.composer-wrap`/`.inputbar`): fixed bawah, inset mengikuti lebar
   panel. Pill `--surface`, border → `--accent` on focus-within. Textarea
   auto-grow (max 132px) di atas **mirror div** yang me-render highlight @mention
   live. Kanan: tombol send kalau ada isi, kalau kosong tombol mic. **Autocomplete
   @mention**: ketik `@`+partial → `.mention-popup`, `↑/↓` pindah, `Tab`/`Enter`
   accept, `Esc` tutup. **Voice**: tap mic → mode `.recording` (dot pulse, timer,
   `.rec-wave`) → kirim bikin pesan `voice` dengan `makeWave`. **Image**: attach
   `sample-photo.svg` → `.preview-strip` → kirim pesan `image`.
5. **Voice bubble** (`.voice`): play/pause circle (ber-hue agent), `.wave` yang
   terisi kiri→kanan mengikuti progress (rAF vs `msg.dur`), durasi `0:SS`.
6. **Image + Lightbox**: card gambar radius 12px (max 320px) + caption serif
   opsional; klik → `.lightbox` fullscreen (Escape/klik-luar tutup).
7. **Thinking** (`.thinking`): byline agent + bubble tiga titik `blink` (stagger
   0.18s), ber-hue agent. Muncul saat giliran agent sedang "mengetik".
8. **Chat-info page** (`.info-page-inner`): identity block, scroller 4 chip agent
   (tap → `.agent-detail`, tap avatar → `AgentInfoFloat`), row "Cari di chat", grup
   "Kelola" dengan dua row destruktif (**Hapus riwayat chat**, **Hapus knowledge**)
   masing-masing di-gate `ActionConfirm`.
9. **Profile panel** (`.sheet.sheet-left`): account card (avatar gradient + badge
   Google "G", email pill), usage card (pill Pay-as-you-go, token used, est. cost,
   progress bar, balance, tombol **Isi ulang**), integrasi (`.set-list`): Gmail,
   Google Calendar, **Tuya Smart** (chip **VIP** → `TuyaVipFloat`). Brand tile =
   mark generik (`Brand`), **bukan** logo pihak ketiga asli. Footer: **Keluar** →
   `ActionConfirm`.
10. **Top-up modal** (`.topup-modal`): balance card, 4 preset chip
    (50k/100k/200k/500k), input Rp custom (min Rp 10.000), summary, 4 bullet
    peringatan, tombol lanjut → placeholder Midtrans. Provider bayar = **stub**.
11. **Postera panel** (`.sheet` kanan): header "Postera" + refresh + close, copy
    intro (posterum = pesan wake-up Ava untuk dirinya sendiri). List `PosterumItem`
    accordion: pill `awaken_at` (hue Ava), preview, chevron; expanded ada tombol
    "Batalkan posterum" (→ `ActionConfirm`). Empty state kalau kosong.

## Interaksi & perilaku

- **Send text** (`sendText`): append pesan `human` `status:"sending"`; ~620ms
  kemudian **16% waktu** flip ke `status:"error"` (uji jalur retry), sisanya clear
  status lalu jalankan `planReply(text)`.
- **Retry**: set pesan gagal kembali `sending`, ~700ms, clear, ulang plan.
- **Orchestrate** (`runPlan`): tiap giliran terencana → tampilkan `Thinking` agent
  `850–1550ms`, sembunyikan, append pesan agent, jeda ~420ms, giliran berikutnya.
- **planReply** (`orchestrator.js`, keyword router → urutan giliran):
  - musik/Spotify (`musik, lagu, playlist, putar, setel, play, pause, volume,
spotify, akustik, kalem`) → **Ava langsung** (Ava pegang Spotify).
  - email/Gmail (`email, mail, gmail, inbox, surel, balas, kirim ke`) → Ava `@yori`
    lalu balasan **Yori**.
  - kalender (`kalender, jadwal, acara, agenda, meeting, rapat, event, reminder`) →
    Ava `@rafal` lalu **Rafal**.
  - smart home/Tuya (`lampu, terang, gelap, tirai, redup, ac, dingin, panas,
colokan, kipas, device, tuya, nyalain, matiin`) → Ava `@zee` lalu **Zee**.
  - starter-bubble (kenalan, "apa itu avagenc", "bisa bantu apa", cek Spotify) →
    balasan Ava langsung; sapaan & terima kasih → Ava langsung; else → fallback Ava.
  - tiap cabang `pick()` baris random dari pool — pool = "suara" produk.
- **Voice/image** → satu balasan Ava dari `VOICE_REPLIES`/`IMAGE_REPLIES`.
- **Search**: buka search sembunyikan composer/chrome; `matches` = id pesan yang
  teks/caption-nya memuat query (case-insensitive); `↑/↓`/Enter cycle; match aktif
  scroll ke tengah + `.active-match`.
- **Clear chat** → kosongkan messages + toast; **Clear knowledge** → no-op + toast;
  **Cancel posterum** → hapus + toast. **Toast**: pill bawah-tengah, auto ~2200ms.
- **Logout** → clear `authed` (kembali ke Login).

**Motion (port persis).** Easing global `--ease`. `rise` (enter row/float 8px/0.42s),
`fade` (overlay), `slidein`/`slidein-left` (side-dock 0.30s), `blink` (thinking),
`pulse` (rec dot), `livewave` (rec bars), `tw-blink` (caret typewriter),
`spin-refresh` (refresh Postera). Push panel di `.canvas`/`.composer-wrap`/`.top-fade`
= 0.30s. Hormati `prefers-reduced-motion`.

**Responsif.** Mobile-first sampai ~360px. Side-dock cap `90vw`. Di bawah 640px
padding kiri composer nambah biar tidak ketutup tombol profil. Layar lebar = kolom
720px terpusat (tidak ada layout desktop terpisah).

## State yang dimodelkan

Global (module/store level):

- `authed` (persisted `avagenc.authed`)
- `messages` (persisted `avagenc.messages`) — `{ id, from, type, text?|caption?+src?|dur?+wave?, time, status? }`
- `thinking: { agent } | null`
- `panel: 'profile' | 'postera' | null`
- `view: 'chat' | 'info'`
- `lightbox: src | null`, `toast: string | null`
- `search: { active, query, idx }`
- `postera` (persisted `avagenc.postera`) — `{ id, message, awaken_at }`
- `openFloat` — satu float aktif ("one popup at a time"; setel = ganti yang lama).

Derived: `matches`, `clampedIdx`, `activeId`, `empty`, plus per-row `grouped`/`tiny`
dan `canSend`/`suggestions` composer. Float (`AgentInfoFloat`, `BubbleChatInfo`,
`TuyaVipFloat`, dst) dirender di root `+page.svelte` (fixed-position), hitung posisi
dari `getBoundingClientRect()` anchor.

## Aset

- `avagenc-ink.svg` / `avagenc-accent.svg` / `avagenc-cream.svg` — logo Avagenc tiga
  fill (`Logo` pilih via prop `variant`): ink=lockup brand, accent=mark empty-state,
  cream=di dalam avatar berwarna.
- `sample-photo.svg` — placeholder image untuk demo image-message & seed.
- **Google "G"** digambar inline (4-warna resmi) hanya untuk affordance auth Google
  — bukan bagian palet brand Avagenc.
- Brand tile integrasi (`Brand`: gmail/calendar/tuya) = mark disederhanakan,
  **jangan** ganti dengan logo pihak ketiga asli.
