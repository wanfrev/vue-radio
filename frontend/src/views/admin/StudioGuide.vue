<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useClipboard } from '@/composables/useClipboard';

interface Credentials {
  mountpoint: string;
  password: string;
  fullUrl: string;
}

const creds = ref<Credentials | null>(null);
const loading = ref(true);
const { copied, copy } = useClipboard();
let lastCopied = '';

onMounted(async () => {
  try {
    const res = await fetch('/api/admin/live/credentials', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) creds.value = (await res.json()) as Credentials;
  } catch {
    // keep null
  } finally {
    loading.value = false;
  }
});

function generateButtConf(): string {
  if (!creds.value) return '';
  const url = new URL(creds.value.fullUrl);
  return [
    '[main]',
    'serverType=0',
    `serverAddr=${url.hostname}`,
    `serverPort=${url.port || '80'}`,
    `password=${creds.value.password}`,
    `mountPoint=${creds.value.mountpoint}`,
    'serverUser=',
    'codec=mp3',
    'bitrate=192',
    'channels=stereo',
    'samplerate=44100',
    'record=0',
    'inputDevice=',
    'codec_quality=2',
    'activate=0',
    'signalThreshold=',
    'silenceThreshold=',
    'rescueMode=0',
    'rescueThreshold=',
    'rescueMP3=',
    'rescueWAV=',
    'volume=100',
    'songUpdate=0',
  ].join('\n');
}

function downloadConf() {
  const text = generateButtConf();
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'radio_streaming_butt.conf';
  a.click();
  URL.revokeObjectURL(url);
}

function copyField(field: string, value: string) {
  lastCopied = field;
  copy(value);
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-2">Manual del Locutor</h1>
    <p class="text-slate-400 text-sm mb-6">
      Todo lo que necesitas para transmitir en vivo desde Windows.
    </p>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Paso 1: Instalar BUTT -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="flex items-center justify-center h-8 w-8 rounded-full bg-brand-600/30 text-brand-300 font-bold text-sm shrink-0">1</span>
          <h2 class="font-semibold">Instalar BUTT</h2>
        </div>
        <p class="text-sm text-slate-400 mb-4">
          BUTT (Broadcast Using This Tool) es el programa que envía tu micrófono a la radio. Es gratuito y funciona en Windows.
        </p>
        <a
          href="https://sourceforge.net/projects/butt/files/latest/download"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 ring-1 ring-brand-500/30 transition"
        >
          Descargar BUTT
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
          </svg>
        </a>
        <div class="mt-3 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
          <p class="font-medium text-slate-300 mb-1">Requisitos:</p>
          <ul class="space-y-1 list-disc list-inside">
            <li>Windows 10 o superior</li>
            <li>Micrófono conectado</li>
            <li>Internet estable (mínimo 1 Mbps de subida)</li>
          </ul>
        </div>
      </div>

      <!-- Paso 2: Configurar -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="flex items-center justify-center h-8 w-8 rounded-full bg-brand-600/30 text-brand-300 font-bold text-sm shrink-0">2</span>
          <h2 class="font-semibold">Configurar la conexión</h2>
        </div>

        <template v-if="loading">
          <p class="text-sm text-slate-500">Cargando credenciales…</p>
        </template>
        <template v-else-if="!creds">
          <p class="text-sm text-slate-500">
            Las credenciales no están disponibles. Verifica que Azuracast esté configurado en el <code class="bg-slate-800 px-1 rounded">.env</code> del backend.
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-slate-400 mb-3">
            Dos opciones: descarga el archivo de configuración ya listo, o introduce los datos manualmente en BUTT.
          </p>

          <button
            type="button"
            class="w-full text-sm px-4 py-2.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 ring-1 ring-emerald-500/30 transition mb-4"
            @click="downloadConf"
          >
            Descargar archivo de configuración (.conf)
          </button>

          <div class="p-3 bg-slate-800/50 rounded-lg space-y-1.5 text-sm">
            <p class="font-medium text-slate-300 mb-1">Datos para configurar manual:</p>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">Servidor:</span>
              <span class="text-slate-200 font-mono text-xs">{{ creds.fullUrl.replace(/https?:\/\//, '').split('/')[0] }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">Mountpoint:</span>
              <span class="text-slate-200 font-mono text-xs">{{ creds.mountpoint }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">Contraseña:</span>
              <div class="flex items-center gap-2">
                <span class="text-slate-200 font-mono text-xs">{{ creds.password }}</span>
                <button
                  type="button"
                  class="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400 hover:text-white"
                  @click="copyField('pass', creds.password)"
                >{{ copied && lastCopied === 'pass' ? 'Copiado' : 'Copiar' }}</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Paso 3: Transmitir -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="flex items-center justify-center h-8 w-8 rounded-full bg-brand-600/30 text-brand-300 font-bold text-sm shrink-0">3</span>
          <h2 class="font-semibold">Entrar al aire</h2>
        </div>
        <ol class="space-y-3 text-sm text-slate-400">
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">a.</span>
            Abre BUTT (doble clic en el archivo <code class="bg-slate-800 px-1 rounded text-xs">.conf</code> o en el icono del programa).
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">b.</span>
            Presiona el botón <strong class="text-white">Play</strong> (triángulo) en BUTT.
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">c.</span>
            El AutoDJ se silenciará automáticamente. Tu micrófono estará al aire.
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">d.</span>
            Habla normalmente. El recuadro de "Ahora suena" en la web pública mostrará "EN VIVO".
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">e.</span>
            Al terminar, presiona <strong class="text-white">Stop</strong> en BUTT. La música volverá sola.
          </li>
        </ol>
      </div>

      <!-- Paso 4: Subir música -->
      <div class="card">
        <div class="flex items-center gap-3 mb-4">
          <span class="flex items-center justify-center h-8 w-8 rounded-full bg-brand-600/30 text-brand-300 font-bold text-sm shrink-0">4</span>
          <h2 class="font-semibold">Gestionar la música</h2>
        </div>
        <p class="text-sm text-slate-400 mb-3">
          Para que la radio suene 24/7 sin ti, necesitas subir música al AutoDJ:
        </p>
        <ol class="space-y-2 text-sm text-slate-400">
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">a.</span>
            Entra al <strong class="text-white">Dashboard de Azuracast</strong> (ver sección "Estudio" &gt; "Abrir Azuracast Dashboard").
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">b.</span>
            Ve a <strong class="text-white">Media &gt; Music Files</strong> y arrastra tus archivos MP3.
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">c.</span>
            Ve a <strong class="text-white">Playlists</strong> y crea listas de reproducción. Agrega las canciones.
          </li>
          <li class="flex gap-2">
            <span class="text-brand-400 font-bold">d.</span>
            El AutoDJ reproducirá automáticamente lo que haya en las playlists activas.
          </li>
        </ol>
        <div class="mt-4 p-3 bg-amber-500/10 rounded-lg ring-1 ring-amber-500/20 text-xs text-amber-300/80">
          <strong>Importante:</strong> Si subes música y la radio sigue en "EN VIVO", la música nueva no sonará hasta que el locutor se desconecte (Stop en BUTT) o reinicies el AutoDJ desde el panel de Estudio.
        </div>
      </div>

      <!-- Consejos -->
      <div class="card col-span-full lg:col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <span class="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500/30 text-amber-300 font-bold text-sm shrink-0">!</span>
          <h2 class="font-semibold">Consejos para buena calidad</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-400">
          <div class="space-y-2">
            <p class="font-medium text-slate-300">Micrófono</p>
            <ul class="space-y-1 list-disc list-inside text-xs">
              <li>Usa audífonos, no parlantes (evita eco).</li>
              <li>Habla a ~15 cm del micrófono.</li>
              <li>Cierra ventanas para reducir ruido ambiente.</li>
            </ul>
          </div>
          <div class="space-y-2">
            <p class="font-medium text-slate-300">Internet</p>
            <ul class="space-y-1 list-disc list-inside text-xs">
              <li>Usa cable ethernet, no WiFi.</li>
              <li>Cierra otras apps que consuman ancho de banda.</li>
              <li>Mínimo 1 Mbps de subida estable.</li>
            </ul>
          </div>
          <div class="space-y-2">
            <p class="font-medium text-slate-300">En vivo</p>
            <ul class="space-y-1 list-disc list-inside text-xs">
              <li>Antes de empezar, verifica en la web pública que todo suene bien.</li>
              <li>Al terminar, SIEMPRE presiona Stop en BUTT.</li>
              <li>Si hay silencio, revisa que el AutoDJ tenga música cargada.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>