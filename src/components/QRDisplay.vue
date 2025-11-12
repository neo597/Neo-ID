<template>
  <div class="qr-display">
    <!-- Data Matrix Image -->
    <div v-if="qrImage" class="qr-container" :class="sizeClass">
      <img 
        :src="qrImage" 
        :alt="`Data Matrix para ${neonatoNombre}`"
        class="qr-image"
        @error="handleImageError"
      />
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="qr-loading" :class="sizeClass">
      <div class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      <p class="text-xs text-gray-500 mt-1">Generando Data Matrix...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="qr-error" :class="sizeClass">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-500 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <p class="text-xs text-red-600 mt-1">Error generando Data Matrix</p>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="qrImage && showActions" class="qr-actions mt-2">
      <button
        @click="downloadQR"
        class="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        title="Descargar Data Matrix"
      >
        Descargar
      </button>
      <button
        @click="copyQR"
        class="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors ml-2 font-medium"
        title="Copiar Data Matrix"
      >
        Copiar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { QRService, type QRData } from '../services/qr.service';
import { generateDataMatrixDataUrl } from '../utils/datamatrix';

interface Props {
  madreId: string;
  madreDocumento: string;
  neonatoId: string;
  neonatoNombre: string;
  size?: 'small' | 'medium' | 'large';
  showActions?: boolean;
  clinicCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showActions: true,
  clinicCode: undefined,
});

const qrImage = ref<string>('');
const loading = ref(true);
const error = ref(false);

const sizeClass = computed(() => {
  const sizes = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36'
  };
  return sizes[props.size];
});

const generateQR = async () => {
  try {
    loading.value = true;
    error.value = false;
    if (props.clinicCode) {
      qrImage.value = generateDataMatrixDataUrl(props.clinicCode);
      if (!qrImage.value) {
        throw new Error('No se pudo generar el Data Matrix clínico');
      }
    } else {
      const qrData: QRData = QRService.generateQRData(
        props.madreId,
        props.madreDocumento,
        props.neonatoId,
        props.neonatoNombre
      );

      qrImage.value = await QRService.generateQR(qrData);
    }
  } catch (err) {
    console.error('Error generando Data Matrix:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleImageError = () => {
  error.value = true;
  loading.value = false;
};

const downloadQR = () => {
  if (!qrImage.value) return;
  
  const link = document.createElement('a');
  link.href = qrImage.value;
  const fileIdentifier = props.clinicCode || `${props.neonatoNombre}-${props.madreDocumento}`;
  link.download = `DataMatrix-${fileIdentifier}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyQR = async () => {
  if (!qrImage.value) return;
  
  try {
    // Convertir data URL a blob
    const response = await fetch(qrImage.value);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/svg+xml': blob
      })
    ]);
    
    // Mostrar feedback (opcional)
    console.log('Data Matrix copiado al portapapeles');
  } catch (err) {
    console.error('Error copiando Data Matrix:', err);
  }
};

onMounted(() => {
  generateQR();
});

watch(
  () => [props.clinicCode, props.madreId, props.neonatoId, props.neonatoNombre, props.madreDocumento],
  () => {
    generateQR();
  },
);
</script>

<style scoped>
.qr-display {
  @apply flex flex-col items-center;
}

.qr-container {
  @apply relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-300 bg-white max-w-full max-h-full;
  z-index: 10;
}

.qr-image {
  @apply w-full h-full object-cover;
}


.qr-loading {
  @apply flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50;
}

.qr-error {
  @apply flex items-center justify-center border border-red-200 rounded-lg bg-red-50;
}

.qr-actions {
  @apply flex justify-center gap-1;
}
</style>
