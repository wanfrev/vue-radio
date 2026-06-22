<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DonationAccount } from '@/services/api';

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
});

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
      <ul class="space-y-3 mb-8">
        <li
          v-for="acc in accounts"
          :key="acc.id"
          :class="['card flex flex-col gap-3', !acc.active ? 'opacity-40' : '']"
        >
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-slate-500 mb-1">Banco</label>
              <input
                :value="acc.bankName"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.bankName = t.value; }"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Titular</label>
              <input
                :value="acc.accountHolder"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.accountHolder = t.value; }"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">CLABE (18 dígitos)</label>
              <input
                :value="acc.clabe"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.clabe = t.value; }"
                pattern="\d{18}"
                maxlength="18"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Número de cuenta</label>
              <input
                :value="acc.accountNumber"
                @input="($event) => { const t = $event.target as HTMLInputElement; acc.accountNumber = t.value; }"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Tipo</label>
              <select
                :value="acc.accountType"
                @change="($event) => { const t = $event.target as HTMLSelectElement; acc.accountType = t.value as any; }"
                class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
              >
                <option value="ahorro">Ahorro</option>
                <option value="cheques">Cheques</option>
              </select>
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
        <h2 class="font-semibold mb-3">Nueva cuenta</h2>
        <div class="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs text-slate-500 mb-1">Banco *</label>
            <input v-model="newAccount.bankName" required class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Titular *</label>
            <input v-model="newAccount.accountHolder" required class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">CLABE * (18 dígitos)</label>
            <input v-model="newAccount.clabe" required pattern="\d{18}" maxlength="18" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Número de cuenta</label>
            <input v-model="newAccount.accountNumber" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Tipo</label>
            <select v-model="newAccount.accountType" class="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400">
              <option value="ahorro">Ahorro</option>
              <option value="cheques">Cheques</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          class="btn-primary text-sm"
          :disabled="saving === 0"
          @click="create()"
        >
          {{ saving === 0 ? 'Creando…' : 'Crear cuenta' }}
        </button>
      </div>
    </template>
  </div>
</template>
