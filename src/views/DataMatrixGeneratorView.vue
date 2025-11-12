<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader
      title="Generador Data Matrix"
      subtitle="Códigos únicos para la identificación neonatal"
      showBack
    />

    <div class="p-4 space-y-6">
      <div class="bg-white rounded-2xl shadow-sm border border-blue-100">
        <div class="p-6 space-y-6">
          <header class="text-center space-y-2">
            <h1 class="text-2xl font-bold text-gray-900">
              Generador de Códigos Data Matrix
            </h1>
            <p class="text-sm text-gray-500 max-w-2xl mx-auto">
              Crea y administra lotes de identificadores únicos para neonatos. Cada código se genera evitando duplicados y
              puede exportarse en formato imprimible.
            </p>
          </header>

          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm text-blue-900 font-semibold">
                Códigos únicos garantizados
              </p>
              <p class="text-xs text-blue-700">
                Total generados en esta sesión: {{ usedCodesCount }}
              </p>
            </div>
            <div class="text-xs text-blue-700">
              Prefijo actual: <span class="font-semibold">{{ selectedPrefix }}</span>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-gray-700">
                  Selecciona el prefijo
                </span>
                <select
                  v-model="selectedPrefix"
                  class="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option v-for="prefix in prefixes" :key="prefix" :value="prefix">
                    {{ prefix }}
                  </option>
                </select>
              </label>
            </div>

            <div class="flex flex-col gap-2">
              <button
                type="button"
                @click="addCode"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:bg-blue-800"
              >
                <span aria-hidden="true" class="inline-flex items-center justify-center">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                Generar código
              </button>
              <button
                type="button"
                @click="generateMultiple(10)"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Generar 10 códigos
              </button>
              <button
                type="button"
                @click="generateMultiple(50)"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Generar 50 códigos
              </button>
              <button
                type="button"
                @click="generateMultiple(100)"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Generar 100 códigos
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              @click="printCatalog"
              :disabled="!hasCodes"
              class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 active:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true" class="inline-flex items-center justify-center">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 9V2h10v7" />
                  <path d="M20 13v6h-3v3H7v-3H4v-6z" />
                  <path d="M9 13h6" />
                </svg>
              </span>
              Imprimir catálogo
            </button>
            <button
              type="button"
              @click="clearAll"
              :disabled="!hasCodes"
              class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true" class="inline-flex items-center justify-center">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M5 6l1 14c.06 1 1 2 2 2h8c1 0 2-.94 2-2l1-14" />
                </svg>
              </span>
              Limpiar todo
            </button>
          </div>

          <section v-if="hasCodes" class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                Códigos generados
              </h2>
              <span class="text-sm text-gray-500">
                {{ codes.length }} códigos activos
              </span>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <article
                v-for="item in codes"
                :key="item.id"
                class="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow"
              >
                <div class="flex justify-center">
                  <img
                    :src="item.dataUrl"
                    :alt="`Código Data Matrix ${item.code}`"
                    class="h-24 w-24"
                  />
                </div>
                <p class="mt-3 text-center font-mono text-xs font-bold text-gray-900">
                  {{ item.code }}
                </p>
                <div class="mt-3 grid gap-2">
                  <button
                    type="button"
                    @click="regenerateCode(item.id)"
                    class="inline-flex items-center justify-center gap-1 rounded-lg bg-yellow-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-yellow-600 active:bg-yellow-700"
                  >
                    <span aria-hidden="true" class="inline-flex items-center justify-center">
                      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 2v6h-6" />
                        <path d="M3 22v-6h6" />
                        <path d="M3 8a9 9 0 0 1 14.94-6.34L21 8" />
                        <path d="M21 16a9 9 0 0 1-14.94 6.34L3 16" />
                      </svg>
                    </span>
                    Regenerar
                  </button>
                  <button
                    type="button"
                    @click="removeCode(item.id)"
                    class="inline-flex items-center justify-center gap-1 rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 active:bg-red-700"
                  >
                    <span aria-hidden="true" class="inline-flex items-center justify-center">
                      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M5 6l1 14c.06 1 1 2 2 2h8c1 0 2-.94 2-2l1-14" />
                      </svg>
                    </span>
                    Eliminar
                  </button>
                </div>
              </article>
            </div>
          </section>

          <div v-else class="py-12 text-center text-gray-500">
            <p class="text-lg font-medium">Aún no hay códigos generados</p>
            <p class="text-sm mt-2">
              Usa el prefijo deseado y pulsa en <span class="font-semibold">Generar código</span> para comenzar.
            </p>
          </div>
        </div>
      </div>
    </div>

    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import { generateDataMatrixDataUrl } from '../utils/datamatrix';

type CodePrefix = 'NEO37' | 'NAB38';

interface CodeItem {
  id: number;
  code: string;
  dataUrl: string;
}

const prefixes: CodePrefix[] = ['NEO37', 'NAB38'];
const selectedPrefix = ref<CodePrefix>('NEO37');
const codes = ref<CodeItem[]>([]);
const usedCodes = ref<Set<string>>(new Set());
const dataMatrixCache = new Map<string, string>();

const usedCodesCount = computed(() => usedCodes.value.size);
const hasCodes = computed(() => codes.value.length > 0);

const generateDataMatrix = (data: string): string => {
  if (dataMatrixCache.has(data)) {
    return dataMatrixCache.get(data)!;
  }

  const dataUrl = generateDataMatrixDataUrl(data);
  if (dataUrl) {
    dataMatrixCache.set(data, dataUrl);
  }
  return dataUrl;
};

const createCodeItem = (code: string, offset = 0): CodeItem => ({
  id: Date.now() + Math.random() + offset,
  code,
  dataUrl: generateDataMatrix(code),
});

const generateUniqueCode = (prefix: CodePrefix): string | null => {
  let newCode: string | null = null;
  let attempts = 0;
  const maxAttempts = 10000;

  while (attempts < maxAttempts) {
    const randomDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const candidate = `${prefix}${randomDigits}`;

    if (!usedCodes.value.has(candidate)) {
      newCode = candidate;
      break;
    }

    attempts += 1;
  }

  if (!newCode) {
    console.error('No se pudo generar un código único');
  }

  return newCode;
};

const addCodesToSet = (newCodes: CodeItem[]) => {
  const updated = new Set(usedCodes.value);
  newCodes.forEach((item) => updated.add(item.code));
  usedCodes.value = updated;
};

const initializeCodes = () => {
  const tempUsedCodes = new Set<string>();
  const initialCodes: CodeItem[] = [];

  for (let i = 0; i < 15; i += 1) {
    let newCode: string;
    do {
      const randomDigits = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      newCode = `${selectedPrefix.value}${randomDigits}`;
    } while (tempUsedCodes.has(newCode));

    tempUsedCodes.add(newCode);
    initialCodes.push(createCodeItem(newCode, i));
  }

  codes.value = initialCodes;
  usedCodes.value = tempUsedCodes;
};

const addCode = () => {
  const uniqueCode = generateUniqueCode(selectedPrefix.value);
  if (!uniqueCode) {
    return;
  }

  const newItem = createCodeItem(uniqueCode);

  codes.value = [...codes.value, newItem];
  addCodesToSet([newItem]);
};

const removeCode = (id: number) => {
  const target = codes.value.find((item) => item.id === id);
  if (target) {
    const updated = new Set(usedCodes.value);
    updated.delete(target.code);
    usedCodes.value = updated;
    dataMatrixCache.delete(target.code);
  }

  codes.value = codes.value.filter((item) => item.id !== id);
};

const clearAll = () => {
  codes.value = [];
  usedCodes.value = new Set();
  dataMatrixCache.clear();
};

const regenerateCode = (id: number) => {
  const current = codes.value.find((item) => item.id === id);
  if (!current) {
    return;
  }

  const prefixCandidate = current.code.substring(0, 5) as CodePrefix;
  const prefix = prefixes.includes(prefixCandidate) ? prefixCandidate : selectedPrefix.value;
  const newCode = generateUniqueCode(prefix);

  if (!newCode) {
    return;
  }

  const updatedSet = new Set(usedCodes.value);
  updatedSet.delete(current.code);
  updatedSet.add(newCode);
  usedCodes.value = updatedSet;
  dataMatrixCache.delete(current.code);

  const newDataUrl = generateDataMatrix(newCode);
  codes.value = codes.value.map((item) =>
    item.id === id ? { ...item, code: newCode, dataUrl: newDataUrl } : item,
  );
};

const generateMultiple = (count: number) => {
  if (count <= 0) {
    return;
  }

  const newItems: CodeItem[] = [];

  for (let i = 0; i < count; i += 1) {
    const uniqueCode = generateUniqueCode(selectedPrefix.value);
    if (!uniqueCode) {
      continue;
    }

    newItems.push(createCodeItem(uniqueCode, i));
  }

  if (newItems.length) {
    codes.value = [...codes.value, ...newItems];
    addCodesToSet(newItems);
  }
};

const printCatalog = () => {
  if (!hasCodes.value) {
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return;
  }

  const codesHTML = codes.value
    .map(
      (item) => `
        <div style="page-break-inside: avoid; margin: 15px; display: inline-block; text-align: center; border: 1px solid #ddd; padding: 10px;">
          <img src="${item.dataUrl}" style="width: 100px; height: 100px;" />
          <div style="margin-top: 8px; font-family: monospace; font-size: 11px; font-weight: bold;">${item.code}</div>
        </div>
      `,
    )
    .join('');

  printWindow.document.write(`
      <html>
        <head>
          <title>Catálogo de Códigos Data Matrix</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Catálogo de Códigos Data Matrix</h1>
          <div style="text-align: center;">
            ${codesHTML}
          </div>
        </body>
      </html>
    `);
  printWindow.document.close();
  printWindow.print();
};

onMounted(() => {
  initializeCodes();
});
</script>

