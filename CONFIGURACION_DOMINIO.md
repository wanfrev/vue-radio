# 🌐 Guía de Configuración de Dominio y SSL (HTTPS)

Sigue estos pasos **únicamente cuando ya hayas comprado tu dominio** (ej. `airemedia.net`) y quieras que la radio sea profesional y segura.

---

## PASO 1: Configurar las DNS (En Hostinger o tu Registrador)

Entra al panel de control de tu dominio y crea estos **2 registros A**:

| Tipo | Nombre | Valor (IP del VPS) |
| :--- | :--- | :--- |
| A | `@` (o dejar vacío) | `2.25.77.96` |
| A | `api` | `2.25.77.96` |
| A | `radio` | `2.25.77.96` |

*Nota: La propagación puede tardar de 15 minutos a 24 horas.*

---

## PASO 2: Actualizar el Backend (.env)

Edita el archivo de configuración del servidor:
```bash
nano /opt/radio/backend/.env
```

Actualiza estas líneas para que usen tu dominio:
```env
CORS_ORIGINS=https://airemedia.net,https://api.airemedia.net
AZURACAST_BASE_URL=https://radio.airemedia.net
AUTODJ_API_URL=https://radio.airemedia.net/api/nowplaying/1
```
*(Guarda con Ctrl+O y sal con Ctrl+X)*.

---

## PASO 3: Configurar Nginx para el Dominio

Debes volver a poner la configuración profesional que maneja el tráfico por nombre de dominio.

```bash
nano /opt/radio/nginx.conf
```

**Pega este contenido (Sustituyendo todo lo anterior):**

```nginx
server {
    listen 80;
    server_name airemedia.net api.airemedia.net radio.airemedia.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name airemedia.net;

    ssl_certificate /etc/letsencrypt/live/airemedia.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/airemedia.net/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / { try_files $uri $uri/ /index.html; }
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_set_header Connection '';
        chunked_transfer_encoding off;
    }
}

server {
    listen 443 ssl http2;
    server_name radio.airemedia.net;
    location / {
        proxy_pass http://172.17.0.1:8080; # Reenvía a AzuraCast
        proxy_set_header Host $host;
    }
}
```

---

## PASO 4: Generar Certificados SSL (Gratis con Let's Encrypt)

Ejecuta estos comandos en tu terminal SSH:

```bash
# 1. Instalar Certbot
apt install -y certbot python3-certbot-nginx

# 2. Generar los certificados (Te pedirá un email, pon el tuyo)
certbot --nginx -d airemedia.net -d api.airemedia.net -d radio.airemedia.net
```

Si Certbot te da un error, asegúrate de que las DNS ya se propagaron (puedes probar en `whatsmydns.net`).

---

## PASO 5: Reiniciar el Sistema

```bash
cd /opt/radio
docker compose down
docker compose up -d --build
```

---

## 🏆 Resultado Final:

*   **Tu Web:** `https://airemedia.net`
*   **Tu Panel de Control:** `https://radio.airemedia.net`
*   **Tu API:** `https://api.airemedia.net`

Todo con **HTTPS** activo y funcionando de forma segura.
