# 🚀 Despliegue en Hostinger KVM1

## Prerrequisitos

| Recurso | Estado |
|---------|--------|
| VPS Hostinger KVM1 | Pendiente de compra |
| Dominio (ej: `airemedia.net`) | Pendiente |
| Azuracast instalado | Se instala en el VPS |

---

## 1. Preparación del VPS

```bash
ssh root@tu-ip-hostinger

apt update && apt upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

apt install -y nginx certbot python3-certbot-nginx
```

---

## 2. Instalación de Azuracast

```bash
mkdir -p /var/azuracast && cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/Azuracast/Azuracast/main/docker.sh > docker.sh
chmod +x docker.sh
./docker.sh install
```

Sigue el asistente. Al terminar tendrás el panel en `https://tu-ip`.

---

## 3. DNS

En Hostinger (o tu DNS provider):

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `airemedia.net` | IP del VPS |
| A | `api.airemedia.net` | IP del VPS |

---

## 4. Archivos de despliegue

### 4.1 Dockerfile — backend/

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 4.2 docker-compose.yml — raíz del proyecto

```yaml
services:
  backend:
    build: ./backend
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/radio.db
      # Añadir aquí todas las variables de entorno de producción
    volumes:
      - radio_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro

volumes:
  radio_data:
```

### 4.3 nginx.conf — raíz del proyecto

```nginx
server {
    listen 80;
    server_name airemedia.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name airemedia.net;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 5. Variables de entorno (backend/.env)

```env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
LOG_LEVEL=warn
CORS_ORIGINS=https://airemedia.net
STREAM_URL=https://azuracast.tudominio.com/stream/1.mp3
STREAM_NAME=Aire Media
AUTODJ_API_URL=https://azuracast.tudominio.com/api/station/1/nowplaying
AUTODJ_API_KEY=<TU-API-KEY>
DATABASE_PATH=/data/radio.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<GENERADO-CON-BCRYPT>
JWT_SECRET=<GENERADO-CON-openssl rand -hex 32>
COOKIE_SECRET=<GENERADO-CON-openssl rand -hex 32>
AZURACAST_BASE_URL=https://azuracast.tudominio.com
AZURACAST_API_KEY=<TU-API-KEY>
AZURACAST_STATION_ID=1
AZURACAST_LIVE_DJ_MOUNTPOINT=/stream_live
AZURACAST_LIVE_DJ_PASSWORD=<PASSWORD-DEL-MOUNTPOINT>
```

---

## 6. Puesta en marcha

```bash
cd /opt/radio
git clone <tu-repo> .
cd frontend && npm ci && npm run build && cd ..
docker compose up -d
certbot --nginx -d airemedia.net -d api.airemedia.net
```

---

## 7. Verificación

```bash
curl https://api.airemedia.net/api/now-playing   # metadata
curl https://api.airemedia.net/api/donations      # donaciones
```

Abrir `https://airemedia.net` en el navegador → audio debe sonar.
