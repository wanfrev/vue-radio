# Radio Frontend

Vue 3 + Vite + Pinia + Tailwind SPA for the radio.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:3000` (the
backend). In production, set `VITE_API_BASE` to the public URL of the
backend.

## Architecture

```
App.vue
├── Navbar
├── <RouterView/>          ← pages (Home, History, Schedule, Contact, 404)
├── PersistentPlayer       ← visible bar at the bottom, NEVER unmounts
└── AudioCore              ← the single <audio> element, NEVER unmounts
```

The audio element and the player bar live **outside** the router view, so
the stream does not stop or skip when the user navigates between pages.

## State

- `usePlayerStore` — playback state (isPlaying, volume, muted, streamUrl,
  error). This is the only store the `<audio>` element reacts to.
- `useNowPlayingStore` — current song + history. Driven by the SSE
  subscription in `useNowPlaying.ts`.

The `src` attribute of `<audio>` is set **once** on mount in
`AudioCore.vue`. Updating it would cause the stream to reload and produce
an audible gap. The persistent player only ever calls `play()` / `pause()`
and updates metadata via the Media Session API.
