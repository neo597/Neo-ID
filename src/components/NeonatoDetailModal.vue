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
      <div class="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-pink-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ neonato?.nombre_neonato }}</h2>
              <p class="text-sm text-gray-600">{{ formatDate(neonato?.fecha_nacimiento) }} - {{ neonato?.hora_nacimiento }}</p>
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
        <!-- Información del neonato -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 bg-pink-500 rounded-full"></div>
            Información del Neonato
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-pink-50/50 rounded-xl p-4 border border-pink-100">
              <div class="text-sm text-pink-600 font-medium mb-1">Sexo</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.sexo }}</div>
            </div>
            <div class="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div class="text-sm text-blue-600 font-medium mb-1">Peso</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.peso }}g</div>
            </div>
            <div class="bg-green-50/50 rounded-xl p-4 border border-green-100">
              <div class="text-sm text-green-600 font-medium mb-1">Talla</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.talla }}cm</div>
            </div>
            <div class="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
              <div class="text-sm text-purple-600 font-medium mb-1">PC</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.pc }}cm</div>
            </div>
            <div class="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
              <div class="text-sm text-orange-600 font-medium mb-1">PA</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.pa }}cm</div>
            </div>
            <div class="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
              <div class="text-sm text-cyan-600 font-medium mb-1">PT</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.pt }}cm</div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
              <div class="text-sm text-indigo-600 font-medium mb-1">Permeabilidad Rectal</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.permeabilidad_rectal }}</div>
            </div>
            <div class="bg-teal-50/50 rounded-xl p-4 border border-teal-100">
              <div class="text-sm text-teal-600 font-medium mb-1">Se encuentra en</div>
              <div class="text-gray-900 font-semibold">{{ neonato?.se_encuentra_en }}</div>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-4">
            <div class="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
              <div class="text-sm text-gray-600 font-medium mb-1">Estado</div>
              <div class="flex items-center gap-2">
                <div :class="neonato?.estado ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                <span class="text-gray-900 font-semibold">{{ neonato?.estado ? 'Activo' : 'Inactivo' }}</span>
              </div>
            </div>
            <div class="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
              <div class="text-sm text-yellow-600 font-medium mb-1">Fecha de Registro</div>
              <div class="text-gray-900 font-semibold">{{ formatDate(neonato?.fecha) }}</div>
            </div>
          </div>

          <div v-if="neonato?.observaciones" class="mt-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <div class="text-sm text-gray-600 font-medium mb-1">Observaciones</div>
            <div class="text-gray-900">{{ neonato.observaciones }}</div>
          </div>
        </div>

        <!-- Fotos de Orejas -->
        <div v-if="(neonato?.fotos_oreja_derecha?.length ?? 0) > 0 || (neonato?.fotos_oreja_izquierda?.length ?? 0) > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            Fotos de Orejas
          </h3>
          
          <div class="space-y-6">
            <!-- Oreja Derecha -->
            <div v-if="(neonato?.fotos_oreja_derecha?.length ?? 0) > 0" class="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-100">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-green-600">D</span>
                </div>
                <h4 class="font-semibold text-gray-900">Oreja Derecha</h4>
                <span class="text-sm text-gray-500">{{ neonato?.fotos_oreja_derecha?.length ?? 0 }} foto{{ (neonato?.fotos_oreja_derecha?.length ?? 0) !== 1 ? 's' : '' }}</span>
              </div>
              
              <FotoGallery
                :fotos="neonato?.fotos_oreja_derecha ?? []"
                title="Oreja Derecha"
                :allow-delete="false"
              />
            </div>

            <!-- Oreja Izquierda -->
            <div v-if="(neonato?.fotos_oreja_izquierda?.length ?? 0) > 0" class="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl p-4 border border-blue-100">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-blue-600">I</span>
                </div>
                <h4 class="font-semibold text-gray-900">Oreja Izquierda</h4>
                <span class="text-sm text-gray-500">{{ neonato?.fotos_oreja_izquierda?.length ?? 0 }} foto{{ (neonato?.fotos_oreja_izquierda?.length ?? 0) !== 1 ? 's' : '' }}</span>
              </div>
              
              <FotoGallery
                :fotos="neonato?.fotos_oreja_izquierda ?? []"
                title="Oreja Izquierda"
                :allow-delete="false"
              />
            </div>
          </div>
        </div>

        <!-- Madre relacionada -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            Madre Relacionada
            <span class="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              {{ madre ? 'Asociada' : 'No encontrada' }}
            </span>
          </h3>

          <LoadingSpinner v-if="loadingMadre" />

          <div v-else-if="!madre" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p class="text-gray-500 font-medium">Madre no encontrada</p>
            <p class="text-sm text-gray-400">No se pudo cargar la información de la madre</p>
          </div>

          <div v-else class="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-100">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-lg">{{ madre.nombre_madre }}</h4>
                <p class="text-sm text-gray-600 mb-2">{{ madre.tipo_documento }}: {{ madre.numero_documento }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div class="bg-white/60 rounded-lg p-3">
                    <div class="text-xs text-blue-600 font-medium mb-1">Servicio</div>
                    <div class="text-sm font-semibold text-gray-900">{{ getServicioText(madre.servicio) }}</div>
                  </div>
                  <div v-if="madre.habitacion" class="bg-white/60 rounded-lg p-3">
                    <div class="text-xs text-green-600 font-medium mb-1">Habitación</div>
                    <div class="text-sm font-semibold text-gray-900">{{ madre.habitacion }}</div>
                  </div>
                  <div class="bg-white/60 rounded-lg p-3">
                    <div class="text-xs text-purple-600 font-medium mb-1">Estado</div>
                    <div class="flex items-center gap-2">
                      <div :class="madre.estado ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                      <span class="text-sm font-semibold text-gray-900">{{ madre.estado ? 'Activa' : 'Inactiva' }}</span>
                    </div>
                  </div>
                  <div class="bg-white/60 rounded-lg p-3">
                    <div class="text-xs text-orange-600 font-medium mb-1">Fecha Registro</div>
                    <div class="text-sm font-semibold text-gray-900">{{ formatDate(madre.fecha) }}</div>
                  </div>
                </div>

                <div v-if="madre.observaciones" class="mt-3 bg-white/40 rounded-lg p-3">
                  <div class="text-xs text-gray-500 font-medium mb-1">Observaciones de la Madre</div>
                  <div class="text-sm text-gray-700">{{ madre.observaciones }}</div>
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
            :to="`/neonatos/${neonato?.id_neonato}`"
            class="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Editar Neonato
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FirebaseService } from '../services/firebase.service';
import type { Neonato, Madre } from '../types/models';
import LoadingSpinner from './LoadingSpinner.vue';
import FotoGallery from './FotoGallery.vue';

interface Props {
  isOpen: boolean;
  neonato: Neonato | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const madre = ref<Madre | null>(null);
const loadingMadre = ref(false);

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

const loadMadre = async () => {
  if (!props.neonato?.id_madre) return;
  
  loadingMadre.value = true;
  try {
    const madres = await FirebaseService.getMadres();
    madre.value = madres.find(m => m.id_madre === props.neonato?.id_madre) || null;
  } catch (error) {
    console.error('Error al cargar madre:', error);
  } finally {
    loadingMadre.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

// Cargar madre cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadMadre();
  }
});
</script>
