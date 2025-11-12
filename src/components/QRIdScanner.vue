<template>
  <div class="qr-id-scanner">
    <!-- Input manual y botón de escaneo -->
    <div v-if="!scanning" class="space-y-3">
      <div class="flex gap-2">
        <input
          v-model="qrId"
          type="text"
          :placeholder="placeholder"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @input="handleInput"
        />
        <button
          @click="startScanning"
          type="button"
          class="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          title="Escanear DataMatrix"
          aria-label="Escanear DataMatrix"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
          </svg>
        </button>
      </div>
      
      <!-- ID capturado con opción de limpiar -->
      <div v-if="qrId" class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span class="text-sm font-medium text-green-800">ID capturado:</span>
          <span class="text-sm text-green-700 font-mono">{{ qrId }}</span>
        </div>
        <button
          @click="clearId"
          type="button"
          class="text-red-600 hover:text-red-800 transition-colors"
          title="Limpiar ID"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Escáner activo -->
    <div v-else class="space-y-4">
      <div class="bg-gray-100 rounded-lg p-4">
        <QRScanner
          :width="300"
          :height="200"
          :show-instructions="false"
          :show-controls="false"
          :auto-start="true"
          @scan="handleScan"
          @error="handleScannerError"
        />
      </div>
      
      <div class="flex gap-2">
        <button
          @click="stopScanning"
          type="button"
          class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Cancelar Escaneo
        </button>
        <button
          @click="useManualInput"
          type="button"
          class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Ingresar Manualmente
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div
      v-if="showConfirmDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click="cancelScannedValue"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        @click.stop
      >
        <!-- Header del modal -->
        <div class="bg-blue-50 px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Código Escaneado</h2>
              <p class="text-sm text-gray-600">Confirma el código DataMatrix detectado</p>
            </div>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-1">Código detectado:</div>
            <div class="text-lg font-mono text-gray-900 break-all">{{ scannedValue }}</div>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">
            ¿Es correcto este código? Si es así, se utilizará para continuar con el formulario.
          </p>
        </div>

        <!-- Footer del modal -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div class="flex justify-end gap-3">
            <button
              @click="cancelScannedValue"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmScannedValue"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import QRScanner from './QRScanner.vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  showConfirmation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escanear o ingresar ID del QR',
  showConfirmation: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  confirmed: [value: string];
}>();

const qrId = ref(props.modelValue || '');
const scanning = ref(false);
const scannedValue = ref('');
const showConfirmDialog = ref(false);

// Sincronizar con el valor del padre
watch(() => props.modelValue, (newValue) => {
  qrId.value = newValue || '';
});

// Emitir cambios al padre
const handleInput = () => {
  emit('update:modelValue', qrId.value);
};

const startScanning = () => {
  scanning.value = true;
};

const stopScanning = () => {
  scanning.value = false;
};

const useManualInput = () => {
  scanning.value = false;
};

const handleScan = (data: any) => {
  let scannedData = '';
  
  // Aceptar tanto QR del sistema como DataMatrix pre-impreso
  if (typeof data === 'string') {
    // DataMatrix pre-impreso o texto simple
    scannedData = data;
  } else if (data && data.id) {
    // Objeto con ID
    scannedData = data.id;
  } else {
    // Si es un objeto QR del sistema, usar el ID del neonato como referencia
    scannedData = data.neonatoId || data.madreId || JSON.stringify(data);
  }
  
  scannedValue.value = scannedData;
  scanning.value = false;
  
  if (props.showConfirmation) {
    showConfirmDialog.value = true;
  } else {
    qrId.value = scannedData;
    emit('update:modelValue', scannedData);
  }
};

const handleScannerError = (error: string) => {
  console.warn('Error del escáner:', error);
  // No detener el escaneo por errores menores
};

const clearId = () => {
  qrId.value = '';
  emit('update:modelValue', '');
};

const confirmScannedValue = () => {
  qrId.value = scannedValue.value;
  emit('update:modelValue', scannedValue.value);
  emit('confirmed', scannedValue.value);
  showConfirmDialog.value = false;
};

const cancelScannedValue = () => {
  scannedValue.value = '';
  showConfirmDialog.value = false;
};
</script>

<style scoped>
.qr-id-scanner {
  @apply w-full;
}
</style>
