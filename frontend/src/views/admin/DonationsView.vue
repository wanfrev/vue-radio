<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DonationAccount, DonationField } from '@/services/api';

interface EditableAccount extends Omit<DonationAccount, 'id'> {
  id?: number;
}

const accounts = ref<DonationAccount[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref<number | null>(null);

const newAccount = ref<EditableAccount>({
  bankName: '',
  accountHolder: '',
  clabe: '',
  accountNumber: '',
  accountType: 'ahorro',
  notes: '',
  sortOrder: 0,
  active: true,
  fields: [],
});

function addField(acc: DonationAccount | EditableAccount): void {
  const f: DonationField = { label: '', value: '', copyable: false };
  acc.fields = [...(acc.fields ?? []), f];
}

function removeField(acc: DonationAccount | EditableAccount, idx: number): void {
  acc.fields = (acc.fields ?? []).filter((_, i) => i !== idx);
}

async function fetchAccounts(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetch('/api/admin/donations', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to load');
    const data = (await res.json()) as { accounts: DonationAccount[] };
    accounts.value = data.accounts;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error';
  } finally {
    loading.value = false;
  }
}

async function save(id: number): Promise<void> {
  const acc = accounts.value.find((a) => a.id === id);
  if (!acc) return;
  saving.value = id;
  try {
    await fetch(`/api/admin/donations/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acc),
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Save failed';
  } finally {
    saving.value = null;
  }
}

async function create(): Promise<void> {
  saving.value = 0;
  try {
    const res = await fetch('/api/admin/donations', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount.value),
    });
    if (!res.ok) throw new Error('Create failed');
    await fetchAccounts();
    newAccount.value = {
      bankName: '',
      accountHolder: '',
      clabe: '',
      accountNumber: '',
      accountType: 'ahorro',
      notes: '',
      sortOrder: 0,
      active: true,
      fields: [],
    };
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Create failed';
  } finally {
    saving.value = null;
  }
}

async function deactivate(id: number): Promise<void> {
  if (!confirm('¿Desactivar esta cuenta?')) return;
  try {
    const res = await fetch(`/api/admin/donations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Delete failed');
    await fetchAccounts();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Delete failed';
  }
}

onMounted(() => {
  void fetchAccounts();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Donaciones</h1>

    <div v-if="error" class="mb-4 text-sm text-red-400">{{ error }}</div>

    <div v-if="loading" class="text-sm text-slate-400">Cargando…</div>

    <template v-else>
      <!-- Existing accounts -->
      <ul class="space-y-4 mb-8">
        <li
          v-for="acc in accounts"
          :key="acc.id"
          :class="['card flex flex-col gap-3', !acc.active ? 'opacity-40' : '']"
        >
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Título *</label>
              <input
                :value="acc.bankName"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.bankName = t.value; }"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Orden</label>
              <input
                :value="acc.sortOrder"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.sortOrder = Number(t.value); }"
                type="number"
                min="0"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
          </div>

          <!-- Dynamic fields -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs text-slate-500 uppercase tracking-wider">Campos</span>
              <button type="button" class="text-xs text-brand-400 hover:text-brand-300 px-2 py-0.5 rounded bg-brand-500/10" @click="addField(acc)">+ Agregar</button>
            </div>
            <div v-for="(field, fi) in acc.fields" :key="fi" class="flex items-start gap-2 mb-2">
              <div class="flex-1 grid grid-cols-3 gap-2">
                <input
                  :value="field.label"
                  @input="($event) => { const t = $event.target as HTMLInputElement; acc.fields[fi] = { ...field, label: t.value }; }"
                  placeholder="Etiqueta"
                  class="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
                <input
                  :value="field.value"
                  @input="($event) => { const t = $event.target as HTMLInputElement; acc.fields[fi] = { ...field, value: t.value }; }"
                  placeholder="Valor"
                  class="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
                <label class="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" :checked="field.copyable" @change="($event) => { const t = $event.target as HTMLInputElement; acc.fields[fi] = { ...field, copyable: t.checked }; }" class="rounded accent-brand-500" />
                  Copiar
                </label>
              </div>
              <button type="button" class="text-xs text-red-400 hover:text-red-300 px-1 py-1 shrink-0" @click="removeField(acc, fi)">✕</button>
            </div>
            <p v-if="!acc.fields || acc.fields.length === 0" class="text-xs text-slate-600">Sin campos. Agrega llave-valor como Teléfono, C.I., Correo, etc.</p>
          </div>

          <div>
            <label class="block text-xs text-slate-500 mb-1">Notas</label>
            <input
              :value="acc.notes"
              @input="($event) => { const t = $event.target as HTMLInputElement; acc.notes = t.value; }"
              class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="acc.active"
                @change="($event) => { const t = $event.target as HTMLInputElement; acc.active = t.checked; }"
                class="rounded accent-brand-500"
              />
              Activo
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn-ghost text-sm"
                :disabled="saving === acc.id"
                @click="save(acc.id!)"
              >
                {{ saving === acc.id ? 'Guardando…' : 'Guardar' }}
              </button>
              <button
                type="button"
                class="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full hover:bg-red-400/10 transition"
                @click="deactivate(acc.id!)"
              >
                Desactivar
              </button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Add new -->
      <div class="card border border-brand-800/40">
        <h2 class="font-semibold mb-3">Nuevo método de pago</h2>
        <div class="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs text-slate-500 mb-1">Título *</label>
            <input v-model="newAccount.bankName" required placeholder="Pago Móvil, ZELLE, BBVA..." class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Orden</label>
            <input v-model.number="newAccount.sortOrder" type="number" min="0" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
        </div>

        <!-- Fields for new account -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs text-slate-500 uppercase tracking-wider">Campos</span>
            <button type="button" class="text-xs text-brand-400 hover:text-brand-300 px-2 py-0.5 rounded bg-brand-500/10" @click="addField(newAccount)">+ Agregar</button>
          </div>
          <div v-for="(field, fi) in newAccount.fields" :key="fi" class="flex items-start gap-2 mb-2">
            <div class="flex-1 grid grid-cols-3 gap-2">
              <input v-model="field.label" placeholder="Etiqueta" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400" />
              <input v-model="field.value" placeholder="Valor" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-400" />
              <label class="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" v-model="field.copyable" class="rounded accent-brand-500" />
                Copiar
              </label>
            </div>
            <button type="button" class="text-xs text-red-400 hover:text-red-300 px-1 py-1 shrink-0" @click="removeField(newAccount, fi)">✕</button>
          </div>
        </div>

        <button
          type="button"
          class="btn-primary text-sm"
          :disabled="saving === 0"
          @click="create()"
        >
          {{ saving === 0 ? 'Creando…' : 'Crear método de pago' }}
        </button>
      </div>
    </template>
  </div>
</template>
