# 🚀 Guía Maestra de Despliegue: Aire Media en Hostinger KVM1

Esta guía contiene todos los pasos realizados, en el orden correcto, incluyendo las correcciones de errores encontradas.

---

## FASE 1: Preparación del Servidor (Limpieza y Herramientas)

Accede por SSH a tu IP `2.25.77.96`.

```bash
# 1. Actualizar el servidor
apt update && apt upgrade -y

# 2. Instalar Docker (Motor de contenedores)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Instalar Node.js 20 (Necesario para construir la web)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git

# 4. Detener el Nginx del sistema (Para que no choque con la Radio)
systemctl stop nginx
systemctl disable nginx
```

---

## FASE 2: Instalación del Motor de Radio (AzuraCast)

```bash
# 1. Crear carpeta e instalar
mkdir -p /var/azuracast && cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/Azuracast/Azuracast/main/docker.sh > docker.sh
chmod +x docker.sh
./docker.sh install  # Responder 'n' a cambiar de canal, dejar puertos 80/443
```

**Configuración en Navegador:**
1. Entra a `http://2.25.77.96`.
2. Crea tu cuenta de admin.
3. Crea la estación `Aire Media`.
4. Ve a tu **Perfil (arriba a la derecha) > API Keys** y crea una llave. **CÓPIALA**.
5. Ve a **Streamer/DJ Accounts**, activa el streaming y crea una cuenta para el locutor.

---

## FASE 3: Despliegue de la Página Web

```bash
# 1. Descargar el código
mkdir -p /opt/radio && cd /opt/radio
git clone <tu-repositorio-url> .

# 2. Configurar variables de entorno (.env)
cp backend/.env.production backend/.env
nano backend/.env
```

**Dentro de `backend/.env` rellena con estos datos:**
*   `STREAM_URL`: `http://2.25.77.96:8000/radio.mp3`
*   `AUTODJ_API_URL`: `http://2.25.77.96/api/nowplaying/1`
*   `AUTODJ_API_KEY`: (Tu llave de AzuraCast)
*   `AZURACAST_API_KEY`: (Tu llave de AzuraCast)
*   `ADMIN_PASSWORD_HASH`: (Generar con `node -e "console.log(require('bcrypt').hashSync('tu_pass', 12))"`)
*   `JWT_SECRET` y `COOKIE_SECRET`: (Generar códigos largos aleatorios)
*   `AZURACAST_LIVE_DJ_PASSWORD`: (La contraseña que le diste al locutor)

---

## FASE 4: Construcción y Encendido

```bash
# 1. Construir el Frontend (La web de oyente)
cd /opt/radio/frontend
npm install
npm run build

# 2. Levantar todo el sistema
cd /opt/radio
docker compose up -d --build
```

---

## FASE 5: Dominio y SSL (Cuando tengas el dominio)

1. Apunta tu dominio `airemedia.net` a la IP `2.25.77.96`.
2. Ejecuta en el VPS:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d airemedia.net -d api.airemedia.net
```

---

## Resumen de URLs una vez terminado:
*   **Web Pública:** `http://2.25.77.96:3000` (o `https://airemedia.net`)
*   **Panel Radio:** `http://2.25.77.96`
*   **Panel Admin Web:** `http://2.25.77.96:3000/admin`
