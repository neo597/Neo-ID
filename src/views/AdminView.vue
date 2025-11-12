<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader title="Administración de Base de Datos" />
    
    <div class="container mx-auto px-4 py-6">
      <!-- Estadísticas Generales -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Estadísticas Generales</h2>
        <div v-if="loading" class="flex justify-center">
          <LoadingSpinner />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      <!-- Datos Detallados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Lista de Madres -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Madres Registradas</h3>
          <div v-if="loadingMadres" class="flex justify-center">
            <LoadingSpinner />
          </div>
          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="madre in madres" 
              :key="madre.id_madre"
              class="border rounded-lg p-3 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-gray-800">{{ madre.nombre_madre }}</p>
                  <p class="text-sm text-gray-600">{{ madre.tipo_documento }}: {{ madre.numero_documento }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(madre.fecha) }}</p>
                </div>
                <span 
                  :class="madre.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ madre.estado ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Neonatos -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Neonatos Registrados</h3>
          <div v-if="loadingNeonatos" class="flex justify-center">
            <LoadingSpinner />
          </div>
          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="neonato in neonatos" 
              :key="neonato.id_neonato"
              class="border rounded-lg p-3 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-gray-800">{{ neonato.nombre_neonato }}</p>
                  <p class="text-sm text-gray-600">Peso: {{ neonato.peso }}g</p>
                  <p class="text-xs text-gray-500">{{ formatDate(neonato.fecha_nacimiento) }}</p>
                </div>
                <span 
                  :class="neonato.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ neonato.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Botones de Acción -->
      <div class="mt-6 flex justify-center space-x-4">
        <button 
          @click="refreshData"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Datos
        </button>
        <button 
          @click="exportData"
          class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Exportar Datos
        </button>
        <button 
          @click="goToFirebaseEvidence"
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ver Evidencia Firebase
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FirebaseService } from '../services/firebase.service'
import type { Madre, Neonato, Estadisticas } from '../types/models'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const router = useRouter()
const loading = ref(true)
const loadingMadres = ref(true)
const loadingNeonatos = ref(true)

const estadisticas = ref<Estadisticas>({
  madres: { total: 0, activas: 0, inactivas: 0 },
  neonatos: { total: 0, activos: 0, inactivos: 0 },
  llanto: { total: 0 }
})

const madres = ref<Madre[]>([])
const neonatos = ref<Neonato[]>([])

const loadEstadisticas = async () => {
  try {
    loading.value = true
    estadisticas.value = await FirebaseService.getEstadisticas()
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  } finally {
    loading.value = false
  }
}

const loadMadres = async () => {
  try {
    loadingMadres.value = true
    madres.value = await FirebaseService.getMadres()
  } catch (error) {
    console.error('Error cargando madres:', error)
  } finally {
    loadingMadres.value = false
  }
}

const loadNeonatos = async () => {
  try {
    loadingNeonatos.value = true
    neonatos.value = await FirebaseService.getNeonatos()
  } catch (error) {
    console.error('Error cargando neonatos:', error)
  } finally {
    loadingNeonatos.value = false
  }
}


const refreshData = async () => {
  await Promise.all([
    loadEstadisticas(),
    loadMadres(),
    loadNeonatos()
  ])
}

const exportData = () => {
  const data = {
    estadisticas: estadisticas.value,
    madres: madres.value,
    neonatos: neonatos.value,
    fechaExportacion: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neoid-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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

const goToFirebaseEvidence = () => {
  router.push('/firebase-evidence')
}

onMounted(() => {
  refreshData()
})
</script>
