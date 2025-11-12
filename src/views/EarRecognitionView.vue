<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader
      title="Reconocimiento de Orejas"
      :show-back="true"
    />

    <div class="p-4 space-y-6">
      <!-- Instrucciones -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">¿Cómo funciona?</h3>
            <p class="text-sm text-gray-700">
              Captura una foto de la oreja del neonato para identificarlo automáticamente. 
              El sistema comparará la imagen con la base de datos de neonatos registrados.
            </p>
          </div>
        </div>
      </div>

      <!-- Botón principal de captura -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <button
          @click="openCaptureModal"
          :disabled="isProcessing"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
          {{ isProcessing ? 'Procesando...' : 'Capturar y Reconocer Oreja' }}
        </button>
      </div>

      <!-- Resultado del reconocimiento -->
      <div v-if="recognitionResult" class="bg-white rounded-xl p-6 shadow-sm">
        <div v-if="recognitionResult.matched && recognitionResult.neonate" class="space-y-4">
          <!-- Match encontrado -->
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-green-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-green-900">¡Neonato Identificado!</h3>
                <p class="text-sm text-green-700">
                  Confianza: {{ recognitionResult.confidence_percentage?.toFixed(2) }}%
                </p>
              </div>
            </div>

            <!-- Información del neonato -->
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs text-gray-600">Nombre</p>
                  <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.nombre_neonato }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">ID</p>
                  <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.id }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Fecha de Nacimiento</p>
                  <p class="font-semibold text-gray-900">{{ formatDate(recognitionResult.neonate.fecha_nacimiento) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Hora</p>
                  <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.hora_nacimiento }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Peso</p>
                  <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.peso }}g</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Talla</p>
                  <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.talla }}cm</p>
                </div>
              </div>

              <div v-if="recognitionResult.neonate.qr_id" class="pt-2 border-t border-green-200">
                <p class="text-xs text-gray-600">QR ID</p>
                <p class="font-semibold text-gray-900">{{ recognitionResult.neonate.qr_id }}</p>
              </div>

              <!-- Botón para ver detalles -->
              <button
                @click="goToNeonato(recognitionResult.neonate!.id)"
                class="w-full mt-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Ver Detalles del Neonato
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <!-- No match -->
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-yellow-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-yellow-900">No se encontró coincidencia</h3>
            </div>
          </div>
          <p class="text-sm text-yellow-800 mb-3">
            La oreja capturada no coincide con ningún neonato registrado en el sistema.
          </p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-yellow-700">Mejor similitud:</span>
              <span class="font-semibold text-yellow-900">
                {{ recognitionResult.best_similarity ? (recognitionResult.best_similarity * 100).toFixed(2) : 'N/A' }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-yellow-700">Umbral requerido:</span>
              <span class="font-semibold text-yellow-900">
                {{ recognitionResult.threshold_required ? (recognitionResult.threshold_required * 100).toFixed(2) : 'N/A' }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-red-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <h3 class="font-semibold text-red-900">Error</h3>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Error -->
    <div
      v-if="showErrorModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click="closeErrorModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        @click.stop
      >
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-red-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Error en el Reconocimiento</h2>
              <p class="text-sm text-gray-600">No se pudo procesar la imagen</p>
            </div>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <div class="space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-sm font-medium text-red-900 mb-2">Detalles del error:</p>
              <p class="text-sm text-red-700">{{ errorModalMessage }}</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-sm font-semibold text-blue-900 mb-2">Sugerencias:</p>
              <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Asegúrate de que la oreja esté completamente visible</li>
                <li>Verifica que haya buena iluminación</li>
                <li>Intenta capturar la oreja desde un ángulo más directo</li>
                <li>Comprueba que el neonato tenga fotos de orejas registradas previamente</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div class="flex justify-end gap-3">
            <button
              @click="closeErrorModal"
              class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de captura de oreja (solo para reconocimiento, no captura ambas) -->
    <EarRecognitionModal
      v-model="showCaptureModal"
      @captured="handleEarCaptured"
    />

    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { EarRecognitionService } from '../services/ear-recognition.service';
import type { RecognizeEarResult } from '../types/ear-recognition';
import PageHeader from '../components/PageHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import EarRecognitionModal from '../components/EarRecognitionModal.vue';

const router = useRouter();
const showCaptureModal = ref(false);
const isProcessing = ref(false);
const recognitionResult = ref<RecognizeEarResult | null>(null);
const errorMessage = ref<string | null>(null);
const showErrorModal = ref(false);
const errorModalMessage = ref<string>('');

const openCaptureModal = () => {
  showCaptureModal.value = true;
  errorMessage.value = null;
  recognitionResult.value = null;
};

const handleEarCaptured = async (photoDataUrl: string) => {
  showCaptureModal.value = false;
  isProcessing.value = true;
  errorMessage.value = null;
  recognitionResult.value = null;
  showErrorModal.value = false;

  try {
    // Convertir data URL a canvas
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    img.onload = async () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Reconocer la oreja
          const result = await EarRecognitionService.recognizeNeonatoFromCanvas(canvas);
          recognitionResult.value = result;
        }
      } catch (error) {
        console.error('Error reconociendo oreja:', error);
        handleError(error);
      } finally {
        isProcessing.value = false;
      }
    };

    img.onerror = () => {
      const error = new Error('Error al cargar la imagen capturada');
      handleError(error);
      isProcessing.value = false;
    };

    img.src = photoDataUrl;
  } catch (error) {
    console.error('Error en el proceso de reconocimiento:', error);
    handleError(error);
    isProcessing.value = false;
  }
};

const handleError = (error: unknown) => {
  let errorMsg = 'Error desconocido al reconocer la oreja';
  
  if (error instanceof Error) {
    errorMsg = error.message;
    
    // Mejorar mensajes de error para el usuario
    if (errorMsg.includes('No se pudieron extraer características')) {
      errorMsg = 'No se pudieron extraer características de la oreja detectada. Asegúrate de que la imagen sea clara y la oreja esté bien visible.';
    } else if (errorMsg.includes('Bad Request') || errorMsg.includes('400')) {
      errorMsg = 'La imagen enviada no es válida. Por favor, intenta capturar nuevamente con mejor iluminación.';
    } else if (errorMsg.includes('No se pudo conectar')) {
      errorMsg = 'No se pudo conectar con el servidor de reconocimiento. Verifica que el servidor Python esté ejecutándose en http://localhost:8000';
    } else if (errorMsg.includes('Error del servidor')) {
      errorMsg = 'Error del servidor al procesar la imagen. Por favor, intenta nuevamente.';
    }
  }
  
  errorMessage.value = errorMsg;
  errorModalMessage.value = errorMsg;
  showErrorModal.value = true;
};

const closeErrorModal = () => {
  showErrorModal.value = false;
  errorModalMessage.value = '';
};

const goToNeonato = (neonatoId: string) => {
  router.push(`/neonatos/${neonatoId}`);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'No especificado';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

