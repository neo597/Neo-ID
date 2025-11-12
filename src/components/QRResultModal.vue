<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Datos Encontrados</h3>
                <p class="text-blue-100 text-sm">Información del QR escaneado</p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="text-white/80 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <!-- Madre Information -->
          <div v-if="data?.madre" class="mb-8">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-blue-900">Información de la Madre</h4>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-blue-700">Nombre Completo</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.madre.nombre_madre }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700">Documento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.madre.tipo_documento }}: {{ data.madre.numero_documento }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700">Servicio</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getServicioText(data.madre.servicio) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700">Estado</label>
                  <span :class="data.madre.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                    <div :class="data.madre.estado ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ data.madre.estado ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Neonato Information -->
          <div v-if="data?.neonato" class="mb-8">
            <div class="bg-pink-50 border border-pink-200 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-pink-900">Información del Neonato</h4>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-pink-700">Nombre</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.neonato.nombre_neonato }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-pink-700">Fecha de Nacimiento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatDate(data.neonato.fecha_nacimiento) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-pink-700">Hora de Nacimiento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.neonato.hora_nacimiento }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-pink-700">Peso y Talla</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.neonato.peso }}g - {{ data.neonato.talla }}cm</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-pink-700">Sexo</label>
                  <p class="text-lg font-semibold text-gray-900">{{ data.neonato.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-pink-700">Estado</label>
                  <span :class="data.neonato.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                    <div :class="data.neonato.estado ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ data.neonato.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Fotos de Orejas -->
          <div v-if="data?.fotos && (data.fotos.fotos_oreja_derecha.length > 0 || data.fotos.fotos_oreja_izquierda.length > 0)" class="mb-8">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h16.5a1.5 1.5 0 011.5 1.5v12.75a1.5 1.5 0 01-1.5 1.5z" />
                  </svg>
                </div>
                <h4 class="text-lg font-bold text-gray-900">Fotos de las Orejas</h4>
              </div>

              <!-- Oreja Derecha -->
              <div v-if="data.fotos.fotos_oreja_derecha.length > 0" class="mb-6">
                <h5 class="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                  Oreja Derecha ({{ data.fotos.fotos_oreja_derecha.length }} foto{{ data.fotos.fotos_oreja_derecha.length !== 1 ? 's' : '' }})
                </h5>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="(foto, index) in data.fotos.fotos_oreja_derecha"
                    :key="`derecha-${index}`"
                    class="relative group cursor-pointer"
                    @click="openImageModal(foto)"
                  >
                    <img
                      :src="foto"
                      :alt="`Oreja derecha ${index + 1}`"
                      class="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Oreja Izquierda -->
              <div v-if="data.fotos.fotos_oreja_izquierda.length > 0">
                <h5 class="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div class="w-4 h-4 bg-pink-500 rounded-full"></div>
                  Oreja Izquierda ({{ data.fotos.fotos_oreja_izquierda.length }} foto{{ data.fotos.fotos_oreja_izquierda.length !== 1 ? 's' : '' }})
                </h5>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="(foto, index) in data.fotos.fotos_oreja_izquierda"
                    :key="`izquierda-${index}`"
                    class="relative group cursor-pointer"
                    @click="openImageModal(foto)"
                  >
                    <img
                      :src="foto"
                      :alt="`Oreja izquierda ${index + 1}`"
                      class="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Data Message -->
          <div v-if="!data?.madre && !data?.neonato" class="text-center py-8">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-yellow-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No se encontraron datos</h3>
            <p class="text-gray-600">El QR escaneado no coincide con ningún registro en la base de datos</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="closeModal"
              class="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
            <button
              v-if="data?.madre || data?.neonato"
              @click="viewDetails"
              class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ver Detalles Completos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="imageModalOpen" class="fixed inset-0 z-60 overflow-y-auto">
      <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="closeImageModal"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative max-w-4xl max-h-[90vh]">
          <button
            @click="closeImageModal"
            class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            :src="selectedImage"
            alt="Imagen ampliada"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

interface QRResultData {
  madre: any | null;
  neonato: any | null;
  fotos?: {
    fotos_oreja_derecha: string[];
    fotos_oreja_izquierda: string[];
  };
}

interface Props {
  isOpen: boolean;
  data: QRResultData | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  viewDetails: [];
}>();

const router = useRouter();
const imageModalOpen = ref(false);
const selectedImage = ref('');

const closeModal = () => {
  emit('close');
};

const viewDetails = () => {
  emit('viewDetails');
};

const openImageModal = (imageUrl: string) => {
  selectedImage.value = imageUrl;
  imageModalOpen.value = true;
};

const closeImageModal = () => {
  imageModalOpen.value = false;
  selectedImage.value = '';
};

const getServicioText = (servicio: string | undefined) => {
  const servicios: Record<string, string> = {
    'observacion': 'Observación',
    'habitacion': 'Habitación',
    'cirugia': 'Cirugía',
    'fuera_institucion': 'Fuera de la institución'
  };
  return servicio ? servicios[servicio] || servicio : 'No especificado';
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'No especificado';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
