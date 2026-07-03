# 🚀 Plan de Producción — Aire Media Radio 24/7

## Arquitectura

```
                     ┌──────────────┐
                     │   Usuario     │
        ejemplo.com  │  (Navegador)  │
             │       └──────┬───────┘
             ▼              │
     ┌───────────────┐      │
     │  Nginx/Caddy  │      │  TLS (Let's Encrypt)
     │  Reverse Proxy│◄─────┘
     │  :443         │
     └───┬───────┬───┘
         │       │
    /api/│       │ / (SPA)
         │       │
    ┌────▼──┐ ┌──▼──────┐     ┌──────────────┐
    │Backend│ │Frontend  │     │  Azuracast   │
    │:3000  │ │dist/     │     │  (Docker)    │
    │Fastify│ │estáticos │     │  :80/:443    │
    │SQLite │ │          │     │  stream.mp3  │
    └───────┘ └─────────┘     │  DJ mount    │
                              └──────────────┘
```

- **Azuracast**: Transmite el audio 24/7. Corre en Docker. Es quien mantiene la música sonando.
- **Backend (Fastify)**: Proxy de metadatos, auth admin, donaciones. Se reinicia sin afectar el audio.
- **Frontend (Vue SPA)**: Sirve archivos estáticos. No tiene estado del lado servidor.
- **Nginx/Caddy**: Reverse proxy con HTTPS. Sirve el frontend y proxea `/api/*` al backend.

---

## 1. Infraestructura (Tú)

### 1.1 VPS

Necesitas un servidor Linux activo 24/7. Recomendaciones:

| Proveedor | Plan | RAM | vCPU | Precio | Ideal para |
|---|---|---|---|---|---|
| **Hetzner CX22** | 2 vCPU, 4 GB | 4 GB | 2 | ~€4.5/mes | ⭐ Mejor relación |
| **Vultr** | 1 vCPU, 1 GB | 1 GB | 1 | ~$6/mes | Justo |
| **DigitalOcean** | 1 vCPU, 2 GB | 2 GB | 1 | ~$12/mes | Bueno |
| **Hetzner CX32** | 4 vCPU, 8 GB | 8 GB | 4 | ~€8.5/mes | Sobrado |

Mínimo recomendado para Azuracast + backend: **2 GB RAM** (Hetzner CX22 va sobrado).

```bash
ssh root@tu-ip
apt update && apt upgrade -y
apt install -y curl git ufw nginx certbot python3-certbot-nginx
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
```

### 1.2 Dominio + DNS

- Compra un dominio (ej: `airemedia.net` en Namecheap, Cloudflare, Porkbun)
- Crea registros DNS:
  ```
  airemedia.net         A   <IP del VPS>
  api.airemedia.net     A   <IP del VPS>
  ```
- Espera a que propaguen (~5-30 min)

---

## 2. Azuracast — Audio 24/7 (Tú)

### 2.1 Instalación

```bash
mkdir -p /var/azuracast && cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/Azuracast/Azuracast/main/docker.sh > docker.sh
chmod +x docker.sh
./docker.sh install

# Durante la instalación:
# - Elige los puertos (deja defaults: 80, 443 para Azuracast)
# - Pon tu dominio
# - Pon una contraseña segura para el admin de Azuracast
```

⚠️ Si Azuracast usa los puertos 80/443, nuestra web usará otros puertos o un subdominio. Alternativa: usa puertos distintos para Azuracast (ej: 8080/8443) y deja 80/443 para nginx.

### 2.2 Configurar la estación

1. Entra al panel de Azuracast en `https://tu-ip` o `https://azuracast.tudominio.com`
2. Crea una estación
3. Sube música (al menos 10-20 canciones para empezar)
4. Activa AutoDJ
5. Anota la **URL del stream público** (ej: `https://tudominio.com/stream/1.mp3`)
6. Crea un **mountpoint de DJ**:
   - Nombre: `/stream_live`
   - Contraseña: genera una segura
   - Asegúrate de que tenga mayor prioridad que AutoDJ
7. Genera una **API Key** de admin (Settings → API Keys)
8. Anota el **Station ID** (normalmente 1)

---

## 3. Backend — Hardening (Yo)

### 3.1 Lo que falta implementar

```bash
cd backend
npm install @fastify/helmet
```

- **Helmet**: security headers (CSP, X-Frame-Options, etc.)
- **CORS producción**: solo permite `https://airemedia.net`
- **Rate limit admin**: 10 req/min en `/api/admin/*`
- **Logs JSON**: sin `pino-pretty` en producción
- **Graceful shutdown**: ya implementado

### 3.2 Variables de entorno de producción

```env
# backend/.env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
LOG_LEVEL=warn

CORS_ORIGINS=https://airemedia.net

STREAM_URL=https://azuracast.tudominio.com/stream/1.mp3
STREAM_NAME=Aire Media

AUTODJ_API_URL=https://azuracast.tudominio.com/api/station/1/nowplaying
AUTODJ_API_KEY=<TU-API-KEY-DE-AZURACAST>
AUTODJ_POLL_INTERVAL_MS=5000

ITUNES_API_URL=https://itunes.apple.com/search
ITUNES_CACHE_TTL_MS=86400000

RATE_LIMIT_MAX=120
RATE_LIMIT_WINDOW_MS=60000
HISTORY_MAX_ITEMS=20
DATABASE_PATH=/data/radio.db

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<GENERADO-CON-BCRYPT>
JWT_SECRET=<GENERADO-CON-openssl rand -hex 32>
COOKIE_SECRET=<GENERADO-CON-openssl rand -hex 32>

AZURACAST_BASE_URL=https://azuracast.tudominio.com
AZURACAST_API_KEY=<TU-API-KEY-DE-AZURACAST>
AZURACAST_STATION_ID=1
AZURACAST_LIVE_DJ_MOUNTPOINT=/stream_live
AZURACAST_LIVE_DJ_PASSWORD=<PASSWORD-DEL-MOUNTPOINT>
```

### 3.3 Generar secretos y hash

```bash
# En el VPS:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # COOKIE_SECRET
cd backend
node -e "console.log(require('bcrypt').hashSync('TU-PASSWORD-AQUI', 12))"  # ADMIN_PASSWORD_HASH
```

---

## 4. Frontend — Build (Yo)

### 4.1 Build de producción

```bash
cd frontend
echo "VITE_API_BASE=https://api.airemedia.net" > .env.production
npm run build
# Salida: frontend/dist/
```

### 4.2 Correcciones pendientes

- Reemplazar mock `sarah.jpg` en `backend/src/services/autodj.ts` por la imagen real
- Las donaciones hardcodeadas en `RightPanel.vue` y `SidePanel.vue` → ya se sirven desde la DB del backend (el `/api/donations` público)
- El formulario de contacto no tiene endpoint backend → se puede dejar como mock o implementar

---

## 5. Deploy — 24/7 (Yo + Tú)

### 5.1 Docker Compose (recomendado)

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    container_name: radio-backend
    restart: always
    volumes:
      - radio_data:/data
    environment:
      - NODE_ENV=production
      # ... todas las variables de .env
    ports:
      - '127.0.0.1:3000:3000'

  nginx:
    image: nginx:alpine
    container_name: radio-nginx
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro

volumes:
  radio_data:
```

### 5.2 Nginx config

```nginx
server {
    listen 80;
    server_name airemedia.net api.airemedia.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name airemedia.net;

    ssl_certificate     /etc/letsencrypt/live/airemedia.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/airemedia.net/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE: disable buffering
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        chunked_transfer_encoding off;
    }

    # Static assets cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 Systemd (alternativa sin Docker)

```ini
# /etc/systemd/system/radio-backend.service
[Unit]
Description=Aire Media Radio Backend
After=network.target

[Service]
Type=simple
User=radio
WorkingDirectory=/opt/radio/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/radio/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable radio-backend
systemctl start radio-backend
```

### 5.4 Certificados SSL

```bash
# Con nginx:
certbot --nginx -d airemedia.net -d api.airemedia.net

# Renovación automática:
certbot renew --dry-run  # prueba
# El cron de certbot ya está configurado al instalar
```

---

## 6. Verificación de producción

### Checklist

- [ ] `curl https://api.airemedia.net/health` → `{"status":"ok",...}`
- [ ] `curl https://api.airemedia.net/api/now-playing` → devuelve canción actual
- [ ] `curl https://api.airemedia.net/api/donations` → devuelve cuentas
- [ ] `https://airemedia.net` → carga la web sin errores
- [ ] Audio suena en el navegador
- [ ] SSE funciona (cambios de canción en tiempo real)
- [ ] `https://airemedia.net/admin` → login funciona
- [ ] Panel admin CRUD donaciones funciona
- [ ] Botón "En Vivo" muestra credenciales de DJ
- [ ] PWA instalable en Android/Chrome
- [ ] PWA instalable en iOS/Safari
- [ ] HTTPS en todo (sin mixed content)
- [ ] CORS no permite orígenes no autorizados
- [ ] Rate limit activo (probar 120+ requests en 1 min)
- [ ] Backup de SQLite configurado (cron diario)

### Prueba de carga rápida

```bash
# 100 requests concurrentes al health
ab -n 100 -c 10 https://api.airemedia.net/health
# Debe responder todos en < 100ms
```

---

## 7. Mantenimiento continuo

### 7.1 Backup de SQLite

```bash
# /etc/cron.daily/radio-backup
#!/bin/bash
sqlite3 /data/radio.db ".backup /backups/radio-$(date +%Y%m%d).db"
find /backups -name "*.db" -mtime +7 -delete
```

### 7.2 Monitoreo 24/7

- **Uptime**: `curl https://api.airemedia.net/health` cada minuto (UptimeRobot, Better Uptime)
- **Logs**: `journalctl -u radio-backend -f` (systemd) o `docker logs radio-backend` (Docker)
- **Disco**: monitorear que `/data/radio.db` no crezca sin control (SQLite con pocas tablas no debería)

### 7.3 Actualizaciones

```bash
# Backend
cd /opt/radio/backend
git pull
npm ci
npm run build
systemctl restart radio-backend

# Frontend
cd /opt/radio/frontend
git pull
npm ci
npm run build
# Nginx recarga automática (los archivos estáticos cambian)
```

---

## 8. Costos estimados (mensual)

| Concepto | Costo |
|---|---|
| VPS (Hetzner CX22) | ~€4.5 |
| Dominio (.net) | ~€12/año (~€1/mes) |
| **Total** | **~€5.5/mes** |

---

## 9. Lo que falta implementar ahora mismo

| Tarea | Prioridad | Quién |
|---|---|---|
| Instalar `@fastify/helmet` + CORS estricto | Alta | Yo (ahora) |
| Corregir mock cover art en `autodj.ts` | Alta | Yo (ahora) |
| Crear `Dockerfile` para backend | Alta | Yo (ahora) |
| Crear `docker-compose.yml` | Alta | Yo (ahora) |
| Crear `nginx.conf` de producción | Alta | Yo (ahora) |
| Comprar VPS + dominio | Bloqueante | Tú |
| Instalar Azuracast | Bloqueante | Tú |
| Configurar DNS | Bloqueante | Tú |
| Generar secretos + `.env` producción | Bloqueante | Tú |
| Poner certificados SSL | Bloqueante | Tú |
| Probar deploy | Final | Los dos |
