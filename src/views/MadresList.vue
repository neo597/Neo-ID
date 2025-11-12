<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader title="Madres" subtitle="Gestión de madres">
      <template #actions>
        <router-link
          to="/madres/nueva"
          class="bg-primary-600 text-white p-2 rounded-lg active:bg-primary-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </router-link>
      </template>
    </PageHeader>

    <div class="px-2 py-4 w-full">
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          @click="filtroEstado = undefined"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === undefined ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Todas
        </button>
        <button
          @click="filtroEstado = true"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === true ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Activas
        </button>
        <button
          @click="filtroEstado = false"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="filtroEstado === false ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
        >
          Inactivas
        </button>
      </div>

      <LoadingSpinner v-if="loading" />

      <EmptyState
        v-else-if="madres.length === 0"
        title="No hay madres registradas"
        message="Agrega la primera madre para comenzar"
      >
        <template #action>
          <router-link
            to="/madres/nueva"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium active:bg-primary-700 transition-colors"
          >
            Agregar Madre
          </router-link>
        </template>
      </EmptyState>

      <div v-else class="space-y-2 w-full">
        <div
          v-for="madre in madres"
          :key="madre.id_madre"
          class="bg-white rounded-lg p-3 hover:shadow-md transition-all duration-200 overflow-hidden w-full"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0 pr-3">
              <h3 class="font-semibold text-gray-900 truncate">{{ madre.nombre_madre }}</h3>
              <p class="text-sm text-gray-600">
                {{ madre.tipo_documento }}: {{ madre.numero_documento }}
              </p>
              <p v-if="madre.servicio" class="text-xs text-blue-600 mt-1">
                {{ getServicioText(madre.servicio) }}
                <span v-if="madre.habitacion"> - {{ madre.habitacion }}</span>
              </p>
              
              <!-- Mostrar QR ID si existe -->
              <div v-if="madre.qr_id" class="mt-2">
                <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  DataMatrix Clínica: {{ madre.qr_id }}
                </span>
              </div>
              
              <!-- Mostrar neonatos asociados -->
              <div v-if="getNeonatosDeMadre(madre.id_madre).length > 0" class="mt-2">
                <p class="text-xs text-green-600 font-medium mb-1">
                  {{ getNeonatosDeMadre(madre.id_madre).length }} neonato{{ getNeonatosDeMadre(madre.id_madre).length !== 1 ? 's' : '' }} registrado{{ getNeonatosDeMadre(madre.id_madre).length !== 1 ? 's' : '' }}
                </p>
                <div class="space-y-0.5 w-full">
                  <div 
                    v-for="neonato in getNeonatosDeMadre(madre.id_madre)" 
                    :key="neonato.id_neonato"
                    class="bg-green-50 border border-green-200 rounded-lg p-2 overflow-hidden w-full"
                  >
                    <div class="flex items-start gap-3 w-full">
                      <!-- Data Matrix -->
                      <div class="flex-shrink-0 w-20 h-20">
                        <QRDisplay
                          :madre-id="madre.id_madre"
                          :madre-documento="madre.numero_documento"
                          :neonato-id="neonato.id_neonato"
                          :neonato-nombre="neonato.nombre_neonato"
                          :clinic-code="neonato.qr_id"
                          size="small"
                          :show-actions="false"
                        />
                      </div>
                      
                      <!-- Información del neonato -->
                      <div class="flex-1 min-w-0 overflow-hidden">
                        <h4 class="text-sm font-semibold text-green-900 truncate">{{ neonato.nombre_neonato }}</h4>
                        <p class="text-xs text-green-700 mt-1 truncate">
                          {{ formatearFecha(neonato.fecha_nacimiento) }} • {{ neonato.hora_nacimiento }}
                        </p>
                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                          <span class="text-xs text-green-600 whitespace-nowrap">{{ neonato.sexo }}</span>
                          <span class="text-xs text-green-600 whitespace-nowrap">{{ neonato.peso }}g</span>
                          <span class="text-xs text-green-600 whitespace-nowrap">{{ neonato.talla }}cm</span>
                        </div>
                      </div>
                      
                      <!-- Estado -->
                      <div class="flex-shrink-0 ml-2">
                        <span 
                          :class="neonato.estado ? 'bg-green-500' : 'bg-gray-400'"
                          class="w-3 h-3 rounded-full block"
                          :title="neonato.estado ? 'Activo' : 'Inactivo'"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mensaje si no tiene neonatos -->
              <div v-else class="mt-2">
                <p class="text-xs text-gray-500">
                  Sin neonatos registrados
                </p>
              </div>
            </div>
            
            <!-- Contenedor de acciones con ancho fijo -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                :class="madre.estado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
              >
                {{ madre.estado ? 'Activa' : 'Inactiva' }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  @click.stop="verDetalleModal(madre)"
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                <button
                  @click.stop="verDetalle(madre.id_madre)"
                  class="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  @click.stop="confirmDeleteMadre(madre)"
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
          <p v-if="madre.observaciones" class="text-sm text-gray-500 line-clamp-2">
            {{ madre.observaciones }}
          </p>
        </div>
      </div>
    </div>

    <MobileNav />

    <!-- Modal de detalles -->
    <MadreDetailModal
      :is-open="modalAbierto"
      :madre="madreSeleccionada"
      @close="cerrarModal"
    />

    <!-- Modal de confirmación de eliminación -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      type="madre"
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
import type { Madre, Neonato } from '../types/models';
import QRDisplay from '../components/QRDisplay.vue';
import PageHeader from '../components/PageHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import MadreDetailModal from '../components/MadreDetailModal.vue';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.vue';

const router = useRouter();
const madres = ref<Madre[]>([]);
const neonatos = ref<Neonato[]>([]);
const loading = ref(true);
const filtroEstado = ref<boolean | undefined>(undefined);

// Variables para el modal
const modalAbierto = ref(false);
const madreSeleccionada = ref<Madre | null>(null);

// Variables para eliminación
const showDeleteModal = ref(false);
const deleteData = ref<Madre | null>(null);

const cargarMadres = async () => {
  loading.value = true;
  try {
    const [madresData, neonatosData] = await Promise.all([
      FirebaseService.getMadres(filtroEstado.value),
      FirebaseService.getNeonatos()
    ]);
    madres.value = madresData;
    neonatos.value = neonatosData;
  } catch (error) {
    console.error('Error al cargar madres:', error);
  } finally {
    loading.value = false;
  }
};

const verDetalle = (id: string) => {
  router.push(`/madres/${id}`);
};

const verDetalleModal = (madre: Madre) => {
  madreSeleccionada.value = madre;
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  madreSeleccionada.value = null;
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

// Computed para obtener neonatos de cada madre
const getNeonatosDeMadre = (madreId: string) => {
  return neonatos.value.filter(neonato => neonato.id_madre === madreId);
};

const confirmDeleteMadre = (madre: Madre) => {
  deleteData.value = madre;
  showDeleteModal.value = true;
};

const handleDeleteConfirm = async ({ type }: { type: 'soft' | 'hard' }) => {
  if (!deleteData.value) return;
  
  try {
    if (type === 'soft') {
      await FirebaseService.updateMadre(deleteData.value.id_madre, { estado: false });
    } else {
      await FirebaseService.deleteMadreConNeonatos(deleteData.value.id_madre);
    }
    
    // Recargar datos
    await cargarMadres();
    showDeleteModal.value = false;
    deleteData.value = null;
  } catch (error) {
    console.error('Error eliminando madre:', error);
    alert('Error al eliminar la madre');
  }
};

const handleDeleteCancel = () => {
  showDeleteModal.value = false;
  deleteData.value = null;
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES');
};

watch(filtroEstado, () => {
  cargarMadres();
});

onMounted(() => {
  cargarMadres();
});
</script>
