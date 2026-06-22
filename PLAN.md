### Fase 1 — Capa de datos persistente (Días 1-2)

**Objetivo**: pasar de configuración en `.env` a una base SQLite editable desde el admin.

**Backend — dependencias nuevas:**

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

**Backend — archivos nuevos:**

- `src/db/index.ts` — inicializa `better-sqlite3` con migraciones automáticas al arrancar el server.
- `src/db/migrations/001_init.sql` — esquema:

```sql
CREATE TABLE IF NOT EXISTS donation_accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_name     TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  clabe         TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type  TEXT DEFAULT 'ahorro',
  notes         TEXT DEFAULT '',
  sort_order    INTEGER DEFAULT 0,
  active        INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS station_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
```

- `src/repos/donations.ts` — CRUD:
  - `findActive()` — solo cuentas con `active = 1`
  - `create(data)` — inserta
  - `update(id, data)` — actualiza
  - `softDelete(id)` — setea `active = 0`
- `src/repos/config.ts` — `get(key)`, `set(key, value)`, `getAll()`

**Backend — config:**

Añadir al `.env`:

```env
DATABASE_PATH=./data/radio.db
```

**Backend — `src/config/env.ts`:**

Añadir `DATABASE_PATH` validado con Zod.

**Verificación:**

- Arranca el servidor → migración crea las tablas automáticamente
- Insertar cuenta usando `sqlite3` CLI
- GET temporal a un endpoint de prueba devuelve la cuenta

---

### Fase 7 — Hardening + Deploy (Días 11-14)

**Objetivo**: listo para producción, seguro y desplegado.

**Backend — seguridad:**

- **helmet**: registrar `@fastify/helmet`:

```bash
npm install @fastify/helmet
```

```typescript
import helmet from '@fastify/helmet';
await app.register(helmet, {
  contentSecurityPolicy: false, // deshabilitamos porque tenemos nuestro propio CSP
});
```

- **HTTPS forzado**: en producción, usar `@fastify/redirect-https` o un reverse proxy (nginx, Caddy).
- **CORS estricto en producción**:

```typescript
await app.register(cors, {
  origin: ['https://radio.tu-dominio.com'],
  credentials: true,
});
```

- **Rate limit diferenciado**:

```typescript
await app.register(rateLimit, {
  global: true,
  max: 120,
  timeWindow: '1 minute',
});

// Para rutas admin, override específico
app.register(async function (adminScope) {
  adminScope.addHook('onRequest', app.authenticate);
  // todas las rutas aquí tienen rate limit global + autenticación
}, { prefix: '/api/admin' });
```

- **Logs**: pino ya está configurado. En producción quitar `pino-pretty` y usar logs JSON.

**Backend — archivos modificados:**

- `server.ts` — helmet + CORS estricto + rate limit admin
- `config/env.ts` — validar que `JWT_SECRET` y `COOKIE_SECRET` no sean los defaults inseguros

**Deploy — recomendaciones por plataforma:**

**Frontend → Cloudflare Pages** (recomendado, gratis):

1. Conectar repo de GitHub
2. Build command: `cd frontend && npm install && npm run build`
3. Build output: `frontend/dist`
4. Environment variables: `VITE_API_BASE=https://api.tu-radio.com`

**Backend → Fly.io** (recomendado, ~$5/mes):

1. `fly launch` en la carpeta `backend/`
2. Configurar `fly.toml` para volumen persistente SQLite:

```toml
[mounts]
  destination = "/data"
  source = "radio_data"
```

3. Environment variables en `fly secrets set`:

```bash
fly secrets set \
  NODE_ENV=production \
  JWT_SECRET=... \
  COOKIE_SECRET=... \
  ADMIN_USERNAME=... \
  ADMIN_PASSWORD_HASH=... \
  AZURACAST_BASE_URL=... \
  AZURACAST_API_KEY=... \
  DATABASE_PATH=/data/radio.db
```

**Alternativa backend → Railway / Render / DigitalOcean App Platform**:

Todos soportan variables de entorno y volúmenes persistentes. La configuración es similar.

**Frontend — build de producción:**

```env
# frontend/.env.production
VITE_API_BASE=https://api.tu-radio.com
```

```bash
cd frontend
npm run build  # → dist/ listo para deploy
```

**Verificación final (checklist de producción):**

- [ ] HTTPS en frontend y backend
- [ ] CORS limitado al dominio exacto
- [ ] JWT_SECRET rotado y seguro (> 64 chars hex)
- [ ] Rate limit activo
- [ ] Sin console.log en producción (solo pino estructurado)
- [ ] Fallback offline visible (PWA)
- [ ] SQLite con backup automático

---

## 📁 Estructura final del proyecto (post-Fase 7)

```
Radio/
├── PLAN.md
├── backend/
│   ├── src/
│   │   ├── server.ts                  # Punto de entrada
│   │   ├── config/
│   │   │   └── env.ts                 # Zod env validation
│   │   ├── db/
│   │   │   ├── index.ts               # SQLite init + migrations
│   │   │   └── migrations/
│   │   │       └── 001_init.sql
│   │   ├── plugins/
│   │   │   └── auth.ts                # requireAuth hook
│   │   ├── repos/
│   │   │   ├── config.ts              # station_config CRUD
│   │   │   └── donations.ts           # donation_accounts CRUD
│   │   ├── routes/
│   │   │   ├── admin/
│   │   │   │   ├── donations.ts       # CRUD protegido
│   │   │   │   └── live.ts            # En Vivo control
│   │   │   ├── auth.ts               # POST login/logout/me
│   │   │   ├── donations.ts           # GET público
│   │   │   ├── health.ts             # GET health/ready
│   │   │   └── radio.ts              # now-playing, history, stream-url, SSE
│   │   ├── schemas/
│   │   │   ├── auth.ts
│   │   │   ├── autodj.ts
│   │   │   └── donations.ts
│   │   └── services/
│   │       ├── autodj.ts             # Cliente AutoDJ + mock
│   │       ├── azuracast.ts          # Cliente Azuracast API
│   │       ├── auth.ts               # JWT sign/verify, bcrypt hash
│   │       ├── cache.ts              # TTL in-memory cache
│   │       ├── coverArt.ts           # iTunes lookup + cache
│   │       ├── liveState.ts          # Estado "en vivo" cacheado
│   │       └── metadata.ts           # Poller + SSE EventEmitter
│   ├── db/                          # Directorio de datos (gitignore)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── App.vue                   # Layout raíz
    │   ├── main.ts                   # createApp + pinia + router
    │   ├── style.css                 # Tailwind + utilidades
    │   ├── env.d.ts                  # Tipos de Vite
    │   ├── components/
    │   │   ├── AudioCore.vue
    │   │   ├── CoverArt.vue
    │   │   ├── DonateButton.vue
    │   │   ├── DonateModal.vue
    │   │   ├── Navbar.vue
    │   │   ├── PersistentPlayer.vue
    │   │   ├── PlayButton.vue
    │   │   ├── VolumeControl.vue
    │   │   ├── WelcomeOverlay.vue
    │   │   └── admin/
    │   │       ├── AdminLayout.vue
    │   │       └── LiveStatusBadge.vue
    │   ├── composables/
    │   │   ├── useAuthGuard.ts
    │   │   ├── useAutoplay.ts
    │   │   ├── useClipboard.ts
    │   │   ├── useMediaSession.ts
    │   │   ├── useNowPlaying.ts
    │   │   └── usePWAInstall.ts
    │   ├── router/
    │   │   └── index.ts
    │   ├── services/
    │   │   └── api.ts
    │   ├── stores/
    │   │   ├── auth.ts
    │   │   ├── donations.ts
    │   │   ├── nowPlaying.ts
    │   │   ├── player.ts
    │   │   └── welcome.ts
    │   └── views/
    │       ├── ContactView.vue
    │       ├── DonateView.vue
    │       ├── HistoryView.vue
    │       ├── HomeView.vue
    │       ├── NotFoundView.vue
    │       ├── ScheduleView.vue
    │       └── admin/
    │           ├── DashboardView.vue
    │           ├── DonationsView.vue
    │           ├── LiveView.vue
    │           └── LoginView.vue
    ├── public/
    │   ├── favicon.svg
    │   └── icons/
    │       ├── icon-192.png
    │       └── icon-512.png
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## ⚠️ Riesgos identificados

1. **Mountpoint de DJ en Azuracast**: debes crear un mountpoint `/stream_live` con contraseña en el panel de Azuracast. Sin esto, el botón "En Vivo" no tiene target.
2. **API key de Azuracast**: generar una API key de uso limitado (no la master de administración). Si se filtra, solo compromete esa estación.
3. **HTTPS en el stream**: la URL de `STREAM_URL` en `.env` DEBE ser HTTPS, o el navegador bloquea el audio en producción.
4. **Autoplay en iOS Safari**: el botón debe ser `<button>` HTML nativo, no un `<div>`. Verificado en Fase 0.
5. **CORS en producción**: `CORS_ORIGINS` debe ser el dominio exacto sin `*`.
6. **JWT_SECRET y COOKIE_SECRET**: generar con `openssl rand -hex 32`. No usar defaults. Rotar cada 6 meses.
7. **Donation info sensible**: no guardas CVV ni números completos de tarjeta — solo CLABE y datos de transferencia. Es seguro.
8. **Mobile background audio**: el reproductor ya tiene `playsinline` en el `<audio>`. El service worker de PWA (Fase 6) ayuda a mantener la conexión en background.

---

## 🚫 Fuera del scope (por ahora)

Si alguna de estas es crítica para el MVP, dímelo y la añadimos como Fase 8:

| Funcionalidad | Notas |
|---|---|
| Pedidos de canciones / voting | Requiere websocket + persistencia + moderación |
| Chat en vivo para oyentes | Similar al voting, requiere moderación |
| Pasarela de pago (Stripe, PayPal) | Pre-completo, pero requiere cuenta comercial |
| Multi-estación / multi-tenant | Requiere SQL escalable + separación por estación |
| App nativa iOS/Android | Flutter o React Native — proyecto separado |
| Tests E2E (Cypress/Playwright) | Recomendado para release, no bloqueante para MVP |
| Métricas avanzadas (Grafana) | Post-MVP |

---

## ✅ Criterio de "MVP listo para producción" (fin de semana 2)

- [ ] Splash + autoplay funciona en iOS Safari y Chrome Android
- [ ] Audio persiste al navegar entre páginas
- [ ] SSE entrega cambios de canción en menos de 2 segundos promedio
- [ ] Admin puede loguearse y editar la información de donaciones
- [ ] Admin puede ver el estado "En Vivo" y desconectar al DJ si es necesario
- [ ] Botón "Donar" en el player muestra cuentas bancarias con opción de copiar
- [ ] PWA instalable en Android (Chrome) e iOS (Safari)

---

## 📌 Prioridad sugerida (si vas justo de tiempo)

El orden que **más valor entrega** por día invertido:

```
Fase 0 (Splash)  →  Fase 2 (Donaciones)  →  Fase 3 (Auth)  →  Fase 4 (Admin básico)  →  Fase 5 (En Vivo)
```

**Fase 1 (SQLite)** puede posponerse — puedes empezar con las donaciones en un JSON estático y migrar después.

**Fase 6 (PWA)** es rápida (~1 día) y da buena impresión en móvil.

**Fase 7 (Hardening)** es necesaria solo antes del lanzamiento público, no durante el desarrollo.
