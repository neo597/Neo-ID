<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader title="Neonatos" subtitle="Gestión de neonatos">
      <template #actions>
        <router-link
          to="/neonatos/nuevo"
          class="bg-primary-600 text-white p-2 rounded-lg active:bg-primary-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </router-link>
      </template>
    </PageHeader>

    <div class="p-4">
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          @click="filtroEstado = undefined"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === undefined ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Todos
        </button>
        <button
          @click="filtroEstado = true"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === true ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Activos
        </button>
        <button
          @click="filtroEstado = false"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === false ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Inactivos
        </button>
      </div>

      <LoadingSpinner v-if="loading" />

      <EmptyState
        v-else-if="neonatos.length === 0"
        title="No hay neonatos registrados"
        message="Agrega el primer neonato para comenzar"
      >
        <template #action>
          <router-link
            to="/neonatos/nuevo"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium active:bg-primary-700 transition-colors"
          >
            Agregar Neonato
          </router-link>
        </template>
      </EmptyState>

      <div v-else class="space-y-3">
        <div
          v-for="neonato in neonatos"
          :key="neonato.id_neonato"
          class="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start gap-4">
            <!-- Data Matrix -->
            <div class="flex-shrink-0">
              <QRDisplay
                :madre-id="neonato.id_madre"
                :madre-documento="getMadreDeNeonato(neonato.id_madre)?.numero_documento || ''"
                :neonato-id="neonato.id_neonato"
                :neonato-nombre="neonato.nombre_neonato"
                :clinic-code="neonato.qr_id"
                size="small"
                :show-actions="false"
              />
            </div>
            
            <!-- Información principal -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1 min-w-0 pr-3">
                  <h3 class="font-semibold text-gray-900 truncate">{{ neonato.nombre_neonato }}</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ formatearFecha(neonato.fecha_nacimiento) }} • {{ neonato.hora_nacimiento }}
                  </p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-pink-600">{{ neonato.sexo }}</span>
                    <span class="text-xs text-pink-600">{{ neonato.peso }}g</span>
                    <span class="text-xs text-pink-600">{{ neonato.talla }}cm</span>
                  </div>
                  
                  <!-- Mostrar QR ID si existe -->
                  <div v-if="neonato.qr_id" class="mt-2">
                    <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      DataMatrix Clínica: {{ neonato.qr_id }}
                    </span>
                  </div>
                </div>
                
                <!-- Estado y acciones -->
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span 
                    :class="neonato.estado ? 'bg-green-500' : 'bg-gray-400'"
                    class="w-3 h-3 rounded-full"
                    :title="neonato.estado ? 'Activo' : 'Inactivo'"
                  ></span>
                  <div class="flex items-center gap-1">
                    <button
                      @click.stop="verDetalleModal(neonato)"
                      class="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <button
                      @click.stop="verDetalle(neonato.id_neonato)"
                      class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button
                      @click.stop="confirmDeleteNeonato(neonato)"
                      class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Información de la madre (simplificada) -->
              <div v-if="getMadreDeNeonato(neonato.id_madre)" class="mt-3 pt-2 border-t border-gray-100">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-blue-600 font-medium">Madre:</span>
                  <span class="text-xs text-blue-900">{{ getMadreDeNeonato(neonato.id_madre)?.nombre_madre }}</span>
                  <span class="text-xs text-blue-700">{{ getMadreDeNeonato(neonato.id_madre)?.numero_documento }}</span>
                </div>
              </div>
              
              <!-- Mensaje si no se encuentra la madre -->
              <div v-else class="mt-3 pt-2 border-t border-gray-100">
                <span class="text-xs text-yellow-600">Madre no encontrada</span>
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            <span class="font-medium">Ubicación:</span> {{ neonato.se_encuentra_en }}
          </div>
        </div>
      </div>
    </div>

    <MobileNav />

    <!-- Modal de detalles -->
    <NeonatoDetailModal
      :is-open="modalAbierto"
      :neonato="neonatoSeleccionado"
      @close="cerrarModal"
    />

    <!-- Modal de confirmación de eliminación -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      type="neonato"
      :data="deleteData"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FirebaseService } from '../services/firebase.service';
import type { Neonato, Madre } from '../types/models';
import QRDisplay from '../components/QRDisplay.vue';
import PageHeader from '../components/PageHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import NeonatoDetailModal from '../components/NeonatoDetailModal.vue';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.vue';

const router = useRouter();
const neonatos = ref<Neonato[]>([]);
const madres = ref<Madre[]>([]);
const loading = ref(true);
const filtroEstado = ref<boolean | undefined>(undefined);

// Variables para el modal
const modalAbierto = ref(false);
const neonatoSeleccionado = ref<Neonato | null>(null);

// Variables para eliminación
const showDeleteModal = ref(false);
const deleteData = ref<Neonato | null>(null);

const cargarNeonatos = async () => {
  loading.value = true;
  try {
    const [neonatosData, madresData] = await Promise.all([
      FirebaseService.getNeonatos(filtroEstado.value),
      FirebaseService.getMadres()
    ]);
    neonatos.value = neonatosData;
    madres.value = madresData;
  } catch (error) {
    console.error('Error al cargar neonatos:', error);
  } finally {
    loading.value = false;
  }
};

const verDetalle = (id: string) => {
  router.push(`/neonatos/${id}`);
};

const verDetalleModal = (neonato: Neonato) => {
  neonatoSeleccionado.value = neonato;
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  neonatoSeleccionado.value = null;
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES');
};

// Computed para obtener la madre de cada neonato
const getMadreDeNeonato = (madreId: string) => {
  return madres.value.find(madre => madre.id_madre === madreId);
};

const getServicioText = (servicio: string) => {
  const servicios: Record<string, string> = {
    'observacion': 'Observación',
    'habitacion': 'Habitación',
    'cirugia': 'Cirugía',
    'fuera_institucion': 'Fuera de la institución'
  };
  return servicios[servicio] || servicio;
};

const confirmDeleteNeonato = (neonato: Neonato) => {
  deleteData.value = neonato;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async ({ type }: { type: 'soft' | 'hard' }) => {
  if (!deleteData.value) return;
  
  try {
    if (type === 'soft') {
      await FirebaseService.updateNeonato(deleteData.value.id_neonato, { estado: false });
    } else {
      await FirebaseService.deleteNeonato(deleteData.value.id_neonato);
    }
    
    // Recargar datos
    await cargarNeonatos();
    showDeleteModal.value = false;
    deleteData.value = null;
  } catch (error) {
    console.error('Error eliminando neonato:', error);
    alert('Error al eliminar el neonato');
  }
};

const handleDeleteCancel = () => {
  showDeleteModal.value = false;
  deleteData.value = null;
};

watch(filtroEstado, () => {
  cargarNeonatos();
});

onMounted(() => {
  cargarNeonatos();
});
</script>
