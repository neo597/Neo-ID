<template>
  <div class="qr-scanner">
    <!-- Scanner Container -->
    <div 
      ref="scannerContainer" 
      class="scanner-container"
      :class="containerClass"
    ></div>

    <!-- Status Messages -->
    <div v-if="status" class="status-message" :class="statusClass">
      <div class="flex items-center gap-2">
        <div v-if="status === 'scanning'" class="animate-pulse">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
        <div v-else-if="status === 'success'" class="w-2 h-2 bg-green-500 rounded-full"></div>
        <div v-else-if="status === 'error'" class="w-2 h-2 bg-red-500 rounded-full"></div>
        
        <span class="text-sm font-medium">{{ statusText }}</span>
      </div>
    </div>

    <!-- Instructions -->
    <div v-if="showInstructions && status === 'scanning'" class="instructions">
      <p class="text-sm text-gray-600 text-center">
        Apunta la cámara al código QR o DataMatrix para escanear
      </p>
    </div>

    <!-- Result Display -->
    <div v-if="result" class="result-display">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span class="font-medium text-green-800">Código Escaneado Exitosamente</span>
        </div>
        <p class="text-sm text-green-700">
          {{ result.neonatoNombre || (result as any).id || 'Código detectado' }} - {{ result.madreDocumento || 'DataMatrix' }}
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div v-if="showControls" class="controls">
      <button
        v-if="status === 'scanning'"
        @click="stopScanning"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Detener Escaneo
      </button>
      <button
        v-else
        @click="startScanning"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Iniciar Escaneo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QRService, type QRData } from '../services/qr.service';

interface Props {
  width?: number;
  height?: number;
  showInstructions?: boolean;
  showControls?: boolean;
  autoStart?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 300,
  showInstructions: true,
  showControls: true,
  autoStart: true
});

const emit = defineEmits<{
  scan: [data: QRData | string];
  error: [error: string];
}>();

const scannerContainer = ref<HTMLDivElement>();
const scanner = ref<Html5QrcodeScanner | null>(null);
const status = ref<'idle' | 'scanning' | 'success' | 'error'>('idle');
const result = ref<QRData | null>(null);

const containerClass = computed(() => {
  return `w-${props.width} h-${props.height}`;
});

const statusClass = computed(() => {
  const classes = {
    idle: 'text-gray-600',
    scanning: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600'
  };
  return classes[status.value];
});

const statusText = computed(() => {
  const texts = {
    idle: 'Listo para escanear',
    scanning: 'Escaneando...',
    success: 'QR detectado',
    error: 'Error al escanear'
  };
  return texts[status.value];
});

const startScanning = async () => {
  if (!scannerContainer.value) return;

  try {
    status.value = 'scanning';
    result.value = null;

    scanner.value = new Html5QrcodeScanner(
      scannerContainer.value.id,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      },
      false
    );

    await scanner.value.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Ignorar errores de escaneo continuo
        if (error.includes('No QR code found')) return;
        console.warn('Error de escaneo:', error);
      }
    );
  } catch (error) {
    console.error('Error iniciando escáner:', error);
    status.value = 'error';
    emit('error', 'No se pudo iniciar la cámara');
  }
};

const stopScanning = async () => {
  if (scanner.value) {
    try {
      await scanner.value.clear();
      scanner.value = null;
      status.value = 'idle';
    } catch (error) {
      console.error('Error deteniendo escáner:', error);
    }
  }
};

const handleScanSuccess = (decodedText: string) => {
  try {
    const qrData = QRService.decodeQR(decodedText);
    result.value = qrData;
    status.value = 'success';
    
    // Detener escaneo automáticamente
    stopScanning();
    
    // Emitir evento
    emit('scan', qrData);
  } catch (error) {
    // Si no es un QR del sistema, tratarlo como texto simple
    console.log('QR no es del sistema, tratando como texto simple:', decodedText);
    result.value = { id: decodedText } as any;
    status.value = 'success';
    
    // Detener escaneo automáticamente
    stopScanning();
    
    // Emitir el texto directamente
    emit('scan', decodedText);
  }
};

onMounted(() => {
  // Generar ID único para el contenedor
  if (scannerContainer.value) {
    scannerContainer.value.id = `qr-scanner-${Date.now()}`;
  }

  if (props.autoStart) {
    startScanning();
  }
});

onUnmounted(() => {
  stopScanning();
});
</script>

<style scoped>
.qr-scanner {
  @apply flex flex-col items-center space-y-4;
}

.scanner-container {
  @apply border-2 border-gray-300 rounded-lg overflow-hidden;
}

.status-message {
  @apply flex items-center justify-center p-2 rounded-lg;
}

.instructions {
  @apply text-center;
}

.result-display {
  @apply w-full max-w-md;
}

.controls {
  @apply flex justify-center;
}
</style>
