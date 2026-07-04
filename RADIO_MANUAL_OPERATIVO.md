# 📻 Manual de Operación: Radio Aire Media

Este documento explica cómo funciona tu radio y cómo deben trabajar tanto el Administrador (Tú) como el Locutor (Radio Operador).

---

## 1. El Concepto Básico
La radio funciona con dos motores independientes que trabajan juntos:

1.  **Azuracast (El "Motor de la radio"):** Gestiona la música 24/7. Tú subes música aquí y él se encarga de que nunca haya silencio.
2.  **Aire Media Web (La "Cara al oyente"):** Es la web que tus oyentes visitan para escuchar, donar y ver qué suena.

---

## 2. Guía para el Locutor (Modo "Sencillo")

El locutor no necesita saber de servidores ni de sistemas complejos. Solo debe conocer dos cosas:

### A. Gestión de Música (Subir archivos)
1.  Entrar a la URL del Dashboard de Azuracast (ej: `https://radio.tudominio.com/dashboard`).
2.  Loguearse con su **Usuario DJ**.
3.  Ir a **Media > Music Files**. Arrastrar y soltar canciones desde su laptop Windows.
4.  Ir a **Playlists** para organizar qué canciones suenan en qué orden.
*No necesita tocar nada más.*

### B. Entrar al Aire (Transmitir en vivo)
1.  **Preparación (Una sola vez):**
    *   Instalar el programa **BUTT** (Broadcast Using This Toolset).
    *   Descargar el archivo de configuración `.conf` que el Administrador le envió.
2.  **Para entrar al aire (Cada día):**
    *   Hacer **doble clic** en el archivo `.conf` (esto abre BUTT ya configurado).
    *   Presionar el botón **"Play"** (triángulo) en BUTT.
    *   *Automáticamente, la radio dejará de poner música automática y transmitirá su micrófono.*
3.  **Para terminar:**
    *   Presionar el botón **"Stop"** (cuadrado) en BUTT.
    *   *La radio retomará la música del AutoDJ automáticamente.*

---

## 3. Guía para el Administrador (Tú - Rol: Sysadmin)

Tu rol es mantener la infraestructura funcionando. Una vez que el sistema está desplegado en el VPS:

1.  **Estabilidad:** El sistema está automatizado. El AutoDJ se encarga de la programación.
2.  **Gestión de Usuarios:** En el panel de Azuracast, crea la cuenta DJ del locutor con permisos limitados.
3.  **Monitoreo:** Si hay algún problema (ej. el locutor dice que no suena nada), usa tu **Panel de Admin** (`/admin/studio`) para:
    *   Ver si hay un DJ conectado.
    *   Forzar la desconexión del DJ (si se le olvidó apagarlo).
    *   Reiniciar el AutoDJ si se bloqueó.

---

## 4. Qué hacer cuando contrates tu VPS

Cuando tengas tu servidor KVM1 de Hostinger, sigue estos pasos:

1.  **Despliegue:** Copia los archivos del proyecto al servidor y ejecuta `docker compose up -d`.
2.  **Configuración Azuracast:** Instalar Azuracast vía los scripts oficiales en el VPS.
3.  **Credenciales:** Genera el archivo `.env.production` con las claves API de Azuracast que obtuviste en el paso anterior.
4.  **Entrega:** Envía al locutor sus credenciales de DJ y el archivo `.conf` descargado desde tu panel de admin.
5.  **Prueba:** Haz una transmisión de 5 minutos para verificar que BUTT conecta y la web refleja el estado "EN VIVO".

---

*Nota: La web de oyentes (`airemedia.net`) es totalmente autónoma y se actualiza sola.*
