# Radio Backend

Fastify + TypeScript proxy for the radio web app.

## Endpoints

| Method | Path             | Description                                  |
|--------|------------------|----------------------------------------------|
| GET    | `/health`        | Liveness + diagnostics                       |
| GET    | `/ready`         | 503 until the first poll completes           |
| GET    | `/api/now-playing` | Current song snapshot                      |
| GET    | `/api/history`   | Last N songs, newest first                   |
| GET    | `/api/stream-url` | Public stream URL + station name           |
| GET    | `/api/stream`    | SSE: `snapshot` then `change` on each song  |

The `/api/stream` SSE emits `event: snapshot` once on connect (with the
current state, or `{ empty: true }` if the first poll has not yet
completed) and `event: change` every time a new song is detected.

## Setup

```bash
cp .env.example .env
# edit .env with your real STREAM_URL and (optionally) AUTODJ_API_URL
npm install
npm run dev
```

## Without an AutoDJ

If `AUTODJ_API_URL` is left blank, the backend serves a deterministic mock
fixture so the frontend can be developed and demoed end-to-end.

## iTunes cover art

If the AutoDJ response does not include `art`, the backend queries
`itunes.apple.com/search` and rewrites the returned artwork URL to 600x600.
Results are cached in-process for `ITUNES_CACHE_TTL_MS` (24h by default).
Swap the `TtlCache` in `src/services/cache.ts` for Redis when you need to
share the cache across multiple backend instances.
