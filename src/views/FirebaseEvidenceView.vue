<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader title="Evidencia de Base de Datos Firebase" />
    
    <div class="container mx-auto px-4 py-6">
      <!-- Estadísticas Generales -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Estadísticas de Firebase</h2>
        <div v-if="loading" class="flex justify-center">
          <LoadingSpinner />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-800">Madres</h3>
            <p class="text-3xl font-bold text-blue-600">{{ estadisticas.madres.total }}</p>
            <p class="text-sm text-blue-700">
              Activas: {{ estadisticas.madres.activas }} | 
              Inactivas: {{ estadisticas.madres.inactivas }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-green-800">Neonatos</h3>
            <p class="text-3xl font-bold text-green-600">{{ estadisticas.neonatos.total }}</p>
            <p class="text-sm text-green-700">
              Activos: {{ estadisticas.neonatos.activos }} | 
              Inactivos: {{ estadisticas.neonatos.inactivos }}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-800">Fotos</h3>
            <p class="text-3xl font-bold text-purple-600">{{ totalFotos }}</p>
            <p class="text-sm text-purple-700">
              Oreja Derecha: {{ fotosOrejaDerecha }} | 
              Oreja Izquierda: {{ fotosOrejaIzquierda }}
            </p>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold text-orange-800">Relaciones</h3>
            <p class="text-3xl font-bold text-orange-600">{{ relaciones.length }}</p>
            <p class="text-sm text-orange-700">
              Madres con neonatos: {{ madresConNeonatos }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs de navegación -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Tab: Datos JSON -->
          <div v-if="activeTab === 'json'" class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">Datos JSON Completos</h3>
              <div class="flex gap-2">
                <button
                  @click="copyToClipboard"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copiar JSON
                </button>
                <button
                  @click="downloadJSON"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Descargar JSON
                </button>
              </div>
            </div>

            <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre class="text-green-400 text-sm font-mono">{{ formattedJSON }}</pre>
            </div>
          </div>

          <!-- Tab: Relaciones -->
          <div v-if="activeTab === 'relaciones'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Relaciones Madre-Neonato</h3>
            
            <div class="space-y-4">
              <div
                v-for="relacion in relaciones"
                :key="relacion.madre.id_madre"
                class="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">{{ relacion.madre.nombre_madre }}</h4>
                    <p class="text-sm text-gray-600">{{ relacion.madre.tipo_documento }}: {{ relacion.madre.numero_documento }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(relacion.madre.fecha) }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">{{ relacion.neonatos.length }} neonato{{ relacion.neonatos.length !== 1 ? 's' : '' }}</span>
                    <button
                      @click="toggleExpand(relacion.madre.id_madre)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      {{ expandedMadres.has(relacion.madre.id_madre) ? 'Ocultar' : 'Ver' }} detalles
                    </button>
                  </div>
                </div>

                <!-- Detalles expandidos -->
                <div v-if="expandedMadres.has(relacion.madre.id_madre)" class="mt-4 space-y-3">
                  <div class="bg-blue-50 p-3 rounded-lg">
                    <h5 class="font-medium text-blue-900 mb-2">Datos de la Madre:</h5>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Servicio:</strong> {{ relacion.madre.servicio }}</div>
                      <div><strong>Habitación:</strong> {{ relacion.madre.habitacion || 'N/A' }}</div>
                      <div><strong>Estado:</strong> {{ relacion.madre.estado ? 'Activa' : 'Inactiva' }}</div>
                      <div><strong>Observaciones:</strong> {{ relacion.madre.observaciones || 'Ninguna' }}</div>
                    </div>
                  </div>

                  <div v-if="relacion.neonatos.length > 0" class="space-y-2">
                    <h5 class="font-medium text-gray-900">Neonatos Asociados:</h5>
                    <div
                      v-for="neonato in relacion.neonatos"
                      :key="neonato.id_neonato"
                      class="bg-green-50 p-3 rounded-lg"
                    >
                      <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Nombre:</strong> {{ neonato.nombre_neonato }}</div>
                        <div><strong>Fecha Nacimiento:</strong> {{ formatDate(neonato.fecha_nacimiento) }}</div>
                        <div><strong>Peso:</strong> {{ neonato.peso }}g</div>
                        <div><strong>Sexo:</strong> {{ neonato.sexo }}</div>
                        <div><strong>Estado:</strong> {{ neonato.estado ? 'Activo' : 'Inactivo' }}</div>
                        <div><strong>Fotos:</strong> {{ (neonato.fotos_oreja_derecha?.length || 0) + (neonato.fotos_oreja_izquierda?.length || 0) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Gestión de Datos -->
          <div v-if="activeTab === 'gestion'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Gestión de Datos</h3>
            
            <!-- Tabla de Madres -->
            <div class="bg-white border rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h4 class="font-semibold text-gray-900">Madres Registradas</h4>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Madre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neonatos</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="madre in madres" :key="madre.id_madre">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ madre.nombre_madre }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(madre.fecha) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ madre.tipo_documento }}: {{ madre.numero_documento }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="madre.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ madre.estado ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ getNeonatosCount(madre.id_madre) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          @click="confirmDeleteMadre(madre)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabla de Neonatos -->
            <div class="bg-white border rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h4 class="font-semibold text-gray-900">Neonatos Registrados</h4>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neonato</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Madre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotos</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="neonato in neonatos" :key="neonato.id_neonato">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ neonato.nombre_neonato }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(neonato.fecha_nacimiento) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ getMadreName(neonato.id_madre) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ neonato.peso }}g
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="neonato.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ neonato.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ (neonato.fotos_oreja_derecha?.length || 0) + (neonato.fotos_oreja_izquierda?.length || 0) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          @click="confirmDeleteNeonato(neonato)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      :type="deleteType"
      :data="deleteData"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FirebaseService } from '../services/firebase.service'
import type { Madre, Neonato, Estadisticas } from '../types/models'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal.vue'

const loading = ref(true)
const activeTab = ref('json')
const expandedMadres = ref(new Set<string>())

const estadisticas = ref<Estadisticas>({
  madres: { total: 0, activas: 0, inactivas: 0 },
  neonatos: { total: 0, activos: 0, inactivos: 0 },
  llanto: { total: 0 }
})

const madres = ref<Madre[]>([])
const neonatos = ref<Neonato[]>([])

// Modal de eliminación
const showDeleteModal = ref(false)
const deleteType = ref<'madre' | 'neonato'>('madre')
const deleteData = ref<Madre | Neonato | null>(null)

const tabs = [
  { id: 'json', name: 'Datos JSON' },
  { id: 'relaciones', name: 'Relaciones' },
  { id: 'gestion', name: 'Gestión de Datos' }
]

// Computed properties
const relaciones = computed(() => {
  const relacionesMap = new Map<string, { madre: Madre; neonatos: Neonato[] }>()
  
  // Agregar todas las madres
  madres.value.forEach(madre => {
    relacionesMap.set(madre.id_madre, { madre, neonatos: [] })
  })
  
  // Agregar neonatos a sus madres
  neonatos.value.forEach(neonato => {
    const relacion = relacionesMap.get(neonato.id_madre)
    if (relacion) {
      relacion.neonatos.push(neonato)
    }
  })
  
  return Array.from(relacionesMap.values())
})

const totalFotos = computed(() => {
  return neonatos.value.reduce((total, neonato) => {
    return total + (neonato.fotos_oreja_derecha?.length || 0) + (neonato.fotos_oreja_izquierda?.length || 0)
  }, 0)
})

const fotosOrejaDerecha = computed(() => {
  return neonatos.value.reduce((total, neonato) => {
    return total + (neonato.fotos_oreja_derecha?.length || 0)
  }, 0)
})

const fotosOrejaIzquierda = computed(() => {
  return neonatos.value.reduce((total, neonato) => {
    return total + (neonato.fotos_oreja_izquierda?.length || 0)
  }, 0)
})

const madresConNeonatos = computed(() => {
  return relaciones.value.filter(relacion => relacion.neonatos.length > 0).length
})

const formattedJSON = computed(() => {
  const data = {
    estadisticas: estadisticas.value,
    madres: madres.value,
    neonatos: neonatos.value,
    relaciones: relaciones.value,
    fechaExportacion: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
})

// Métodos
const loadData = async () => {
  try {
    loading.value = true
    const [estadisticasData, madresData, neonatosData] = await Promise.all([
      FirebaseService.getEstadisticas(),
      FirebaseService.getMadres(),
      FirebaseService.getNeonatos()
    ])
    
    estadisticas.value = estadisticasData
    madres.value = madresData
    neonatos.value = neonatosData
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

const toggleExpand = (madreId: string) => {
  if (expandedMadres.value.has(madreId)) {
    expandedMadres.value.delete(madreId)
  } else {
    expandedMadres.value.add(madreId)
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJSON.value)
    alert('JSON copiado al portapapeles')
  } catch (error) {
    console.error('Error copiando al portapapeles:', error)
  }
}

const downloadJSON = () => {
  const blob = new Blob([formattedJSON.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neoid-firebase-evidence-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const getNeonatosCount = (madreId: string) => {
  return neonatos.value.filter(n => n.id_madre === madreId).length
}

const getMadreName = (madreId: string) => {
  const madre = madres.value.find(m => m.id_madre === madreId)
  return madre ? madre.nombre_madre : 'No encontrada'
}

const confirmDeleteMadre = (madre: Madre) => {
  deleteType.value = 'madre'
  deleteData.value = madre
  showDeleteModal.value = true
}

const confirmDeleteNeonato = (neonato: Neonato) => {
  deleteType.value = 'neonato'
  deleteData.value = neonato
  showDeleteModal.value = true
}

const handleDeleteConfirm = async ({ type }: { type: 'soft' | 'hard' }) => {
  if (!deleteData.value) return
  
  try {
    if (deleteType.value === 'madre') {
      const madre = deleteData.value as Madre
      if (type === 'soft') {
        await FirebaseService.updateMadre(madre.id_madre, { estado: false })
      } else {
        await FirebaseService.deleteMadreConNeonatos(madre.id_madre)
      }
    } else {
      const neonato = deleteData.value as Neonato
      if (type === 'soft') {
        await FirebaseService.updateNeonato(neonato.id_neonato, { estado: false })
      } else {
        await FirebaseService.deleteNeonato(neonato.id_neonato)
      }
    }
    
    // Recargar datos
    await loadData()
    showDeleteModal.value = false
    deleteData.value = null
  } catch (error) {
    console.error('Error eliminando:', error)
    alert('Error al eliminar el registro')
  }
}

const handleDeleteCancel = () => {
  showDeleteModal.value = false
  deleteData.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})
</script>
