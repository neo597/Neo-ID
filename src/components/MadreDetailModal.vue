<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Header del modal -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ madre?.nombre_madre }}</h2>
              <p class="text-sm text-gray-600">{{ madre?.tipo_documento }}: {{ madre?.numero_documento }}</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <!-- Información de la madre -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            Información Personal
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div class="text-sm text-blue-600 font-medium mb-1">Servicio</div>
              <div class="text-gray-900 font-semibold">{{ getServicioText(madre?.servicio) }}</div>
            </div>
            <div v-if="madre?.habitacion" class="bg-green-50/50 rounded-xl p-4 border border-green-100">
              <div class="text-sm text-green-600 font-medium mb-1">Habitación</div>
              <div class="text-gray-900 font-semibold">{{ madre.habitacion }}</div>
            </div>
            <div class="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
              <div class="text-sm text-purple-600 font-medium mb-1">Estado</div>
              <div class="flex items-center gap-2">
                <div :class="madre?.estado ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                <span class="text-gray-900 font-semibold">{{ madre?.estado ? 'Activa' : 'Inactiva' }}</span>
              </div>
            </div>
            <div class="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
              <div class="text-sm text-orange-600 font-medium mb-1">Fecha de Registro</div>
              <div class="text-gray-900 font-semibold">{{ formatDate(madre?.fecha) }}</div>
            </div>
          </div>
          <div v-if="madre?.observaciones" class="mt-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <div class="text-sm text-gray-600 font-medium mb-1">Observaciones</div>
            <div class="text-gray-900">{{ madre.observaciones }}</div>
          </div>
        </div>

        <!-- Neonatos relacionados -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 bg-pink-500 rounded-full"></div>
            Neonatos Relacionados
            <span class="bg-pink-100 text-pink-700 text-xs font-medium px-2 py-1 rounded-full">
              {{ neonatos.length }}
            </span>
          </h3>

          <div v-if="loadingNeonatos" class="text-center py-8">
            <LoadingSpinner />
            <p class="text-sm text-gray-500 mt-2">Cargando neonatos...</p>
          </div>

          <div v-else-if="neonatos.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p class="text-gray-500 font-medium">No hay neonatos registrados</p>
            <p class="text-sm text-gray-400">Esta madre no tiene neonatos asociados</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="neonato in neonatos"
              :key="neonato.id_neonato"
              class="bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-xl p-4 border border-pink-100 hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-pink-600">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ neonato.nombre_neonato }}</h4>
                    <p class="text-sm text-gray-600">{{ neonato.sexo }} • {{ formatDate(neonato.fecha_nacimiento) }}</p>
                  </div>
                </div>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="neonato.estado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                >
                  {{ neonato.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-white/60 rounded-lg p-3 text-center">
                  <div class="text-xs text-gray-500 font-medium mb-1">Peso</div>
                  <div class="text-sm font-semibold text-gray-900">{{ neonato.peso }}g</div>
                </div>
                <div class="bg-white/60 rounded-lg p-3 text-center">
                  <div class="text-xs text-gray-500 font-medium mb-1">Talla</div>
                  <div class="text-sm font-semibold text-gray-900">{{ neonato.talla }}cm</div>
                </div>
                <div class="bg-white/60 rounded-lg p-3 text-center">
                  <div class="text-xs text-gray-500 font-medium mb-1">PC</div>
                  <div class="text-sm font-semibold text-gray-900">{{ neonato.pc }}cm</div>
                </div>
                <div class="bg-white/60 rounded-lg p-3 text-center">
                  <div class="text-xs text-gray-500 font-medium mb-1">Hora Nac.</div>
                  <div class="text-sm font-semibold text-gray-900">{{ neonato.hora_nacimiento }}</div>
                </div>
              </div>

              <div v-if="neonato.observaciones" class="mt-3 bg-white/40 rounded-lg p-3">
                <div class="text-xs text-gray-500 font-medium mb-1">Observaciones</div>
                <div class="text-sm text-gray-700">{{ neonato.observaciones }}</div>
              </div>

              <!-- Data Matrix -->
              <div v-if="madre?.id_madre && madre?.numero_documento" class="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex justify-center">
                  <QRDisplay
                    :madre-id="madre.id_madre"
                    :madre-documento="madre.numero_documento"
                    :neonato-id="neonato.id_neonato"
                    :neonato-nombre="neonato.nombre_neonato"
                    :clinic-code="neonato.qr_id"
                    size="medium"
                    :show-actions="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div class="flex justify-end gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <router-link
            :to="`/madres/${madre?.id_madre}`"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Editar Madre
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FirebaseService } from '../services/firebase.service';
import type { Madre, Neonato } from '../types/models';
import LoadingSpinner from './LoadingSpinner.vue';
import QRDisplay from './QRDisplay.vue';

interface Props {
  isOpen: boolean;
  madre: Madre | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const neonatos = ref<Neonato[]>([]);
const loadingNeonatos = ref(false);

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

const loadNeonatos = async () => {
  if (!props.madre?.id_madre) return;
  
  loadingNeonatos.value = true;
  try {
    // Obtener todos los neonatos y filtrar por id_madre
    const todosLosNeonatos = await FirebaseService.getNeonatos();
    neonatos.value = todosLosNeonatos.filter(neonato => neonato.id_madre === props.madre?.id_madre);
  } catch (error) {
    console.error('Error al cargar neonatos:', error);
  } finally {
    loadingNeonatos.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

// Cargar neonatos cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.madre?.id_madre) {
    loadNeonatos();
  }
});

// También cargar cuando cambie la madre
watch(() => props.madre?.id_madre, (idMadre) => {
  if (idMadre && props.isOpen) {
    loadNeonatos();
  }
});
</script>
