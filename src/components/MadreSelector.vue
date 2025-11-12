<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    
    <!-- Acciones rápidas -->
    <div class="flex gap-2 mb-3">
      <button
        type="button"
        @click="mostrarSoloDisponibles"
        :class="[
          'px-3 py-1 text-xs rounded-full border transition-colors',
          soloDisponibles 
            ? 'bg-green-100 text-green-800 border-green-300' 
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
        ]"
      >
        Solo disponibles
      </button>
      
      <button
        type="button"
        @click="limpiarFiltros"
        v-if="hayFiltrosActivos"
        class="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Campo de búsqueda -->
    <div class="mb-3">
      <input
        v-model="busquedaLocal"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>

    <!-- Filtros -->
    <div class="flex gap-2 mb-3">
      <select
        v-model="filtroTipoDocumentoLocal"
        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Todos los documentos</option>
        <option value="CC">Cédula</option>
        <option value="TI">Tarjeta de Identidad</option>
        <option value="CE">Cédula de Extranjería</option>
        <option value="PP">Pasaporte</option>
      </select>
      
      <select
        v-model="filtroDisponibilidadLocal"
        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Todas</option>
        <option value="disponible">Disponibles</option>
        <option value="ocupada">Con neonatos</option>
      </select>
    </div>

    <!-- Select de madres filtradas -->
    <select
      :value="modelValue"
      @change="onSelectChange"
      :required="required"
      :disabled="cargando"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      <option value="">
        {{ cargando ? 'Cargando madres...' : 'Seleccionar madre' }}
      </option>
      
      <optgroup v-if="madresDisponiblesFiltradas.length > 0" label="📍 Madres Disponibles">
        <option
          v-for="madre in madresDisponiblesFiltradas"
          :key="madre.id_madre"
          :value="madre.id_madre"
        >
          {{ madre.nombre_madre }} - {{ madre.tipo_documento }}: {{ madre.numero_documento }}
          {{ madre.estado ? '' : ' (Inactiva)' }}
        </option>
      </optgroup>
      
      <optgroup v-if="madresOcupadasFiltradas.length > 0" label="👶 Madres con Neonatos">
        <option
          v-for="madre in madresOcupadasFiltradas"
          :key="madre.id_madre"
          :value="madre.id_madre"
        >
          {{ madre.nombre_madre }} - {{ madre.tipo_documento }}: {{ madre.numero_documento }}
          ({{ madresConNeonatos[madre.id_madre] }} neonato{{ madresConNeonatos[madre.id_madre] > 1 ? 's' : '' }})
          {{ madre.estado ? '' : ' - Inactiva' }}
        </option>
      </optgroup>
    </select>
    
    <!-- Madre seleccionada -->
    <div v-if="madreSeleccionada" class="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
      <div class="flex justify-between items-start">
        <div>
          <div class="text-sm font-medium text-primary-900">Madre seleccionada:</div>
          <div class="text-sm text-primary-800">
            {{ madreSeleccionada.nombre_madre }} - {{ madreSeleccionada.tipo_documento }}: {{ madreSeleccionada.numero_documento }}
          </div>
        </div>
        <button
          type="button"
          @click="limpiarSeleccion"
          class="text-primary-600 hover:text-primary-800 transition-colors"
          title="Limpiar selección"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="mostrarEstadisticas && madres.length > 0" class="mt-3 text-xs text-gray-500">
      Mostrando {{ madresFiltradas.length }} de {{ madres.length }} madres
      <span v-if="madresDisponibles > 0">
        • {{ madresDisponibles }} disponibles
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { FirebaseService } from '../services/firebase.service';
import type { Madre, Neonato } from '../types/models';

interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  mostrarEstadisticas?: boolean;
  required?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'madre-seleccionada', madre: Madre | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Madre',
  placeholder: 'Buscar por nombre o documento...',
  mostrarEstadisticas: true,
  required: false
});

const emit = defineEmits<Emits>();

const cargando = ref(true);
const madres = ref<Madre[]>([]);
const neonatos = ref<Neonato[]>([]);
const busquedaLocal = ref('');
const filtroTipoDocumentoLocal = ref('');
const filtroDisponibilidadLocal = ref('');
const soloDisponibles = ref(false);

// Computed para contar neonatos por madre
const madresConNeonatos = computed(() => {
  const conteo: Record<string, number> = {};
  
  madres.value.forEach(madre => {
    conteo[madre.id_madre] = neonatos.value.filter(n => 
      n.id_madre === madre.id_madre && n.estado
    ).length;
  });
  
  return conteo;
});

// Computed para filtrar madres
const madresFiltradas = computed(() => {
  let resultado = madres.value;
  
  // Filtro por búsqueda de texto
  if (busquedaLocal.value.trim()) {
    const termino = busquedaLocal.value.toLowerCase().trim();
    resultado = resultado.filter(madre => 
      madre.nombre_madre.toLowerCase().includes(termino) ||
      madre.numero_documento.toLowerCase().includes(termino)
    );
  }
  
  // Filtro por tipo de documento
  if (filtroTipoDocumentoLocal.value) {
    resultado = resultado.filter(madre => 
      madre.tipo_documento === filtroTipoDocumentoLocal.value
    );
  }
  
  // Filtro por disponibilidad
  if (filtroDisponibilidadLocal.value === 'disponible' || soloDisponibles.value) {
    resultado = resultado.filter(madre => 
      madresConNeonatos.value[madre.id_madre] === 0
    );
  } else if (filtroDisponibilidadLocal.value === 'ocupada') {
    resultado = resultado.filter(madre => 
      madresConNeonatos.value[madre.id_madre] > 0
    );
  }
  
  // Ordenar por disponibilidad (disponibles primero) y luego por nombre
  return resultado.sort((a, b) => {
    const neonatosA = madresConNeonatos.value[a.id_madre] || 0;
    const neonatosB = madresConNeonatos.value[b.id_madre] || 0;
    
    if (neonatosA !== neonatosB) {
      return neonatosA - neonatosB; // Disponibles (0) primero
    }
    
    return a.nombre_madre.localeCompare(b.nombre_madre);
  });
});

// Computed para madres disponibles filtradas
const madresDisponiblesFiltradas = computed(() => {
  return madresFiltradas.value.filter(madre => 
    madresConNeonatos.value[madre.id_madre] === 0
  );
});

// Computed para madres ocupadas filtradas
const madresOcupadasFiltradas = computed(() => {
  return madresFiltradas.value.filter(madre => 
    madresConNeonatos.value[madre.id_madre] > 0
  );
});

// Computed para madre seleccionada
const madreSeleccionada = computed(() => {
  if (!props.modelValue) return null;
  return madres.value.find(m => m.id_madre === props.modelValue) || null;
});

// Computed para estadísticas
const madresDisponibles = computed(() => {
  return madres.value.filter(madre => 
    madresConNeonatos.value[madre.id_madre] === 0
  ).length;
});

// Computed para verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return busquedaLocal.value.trim() !== '' || 
         filtroTipoDocumentoLocal.value !== '' || 
         filtroDisponibilidadLocal.value !== '' ||
         soloDisponibles.value;
});

// Funciones
const seleccionarMadre = (madre: Madre) => {
  emit('update:modelValue', madre.id_madre);
  emit('madre-seleccionada', madre);
};

const onSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const madreId = target.value;
  
  emit('update:modelValue', madreId);
  
  if (madreId) {
    const madre = madres.value.find(m => m.id_madre === madreId);
    emit('madre-seleccionada', madre || null);
  } else {
    emit('madre-seleccionada', null);
  }
};

const limpiarSeleccion = () => {
  emit('update:modelValue', '');
  emit('madre-seleccionada', null);
};

const mostrarSoloDisponibles = () => {
  soloDisponibles.value = !soloDisponibles.value;
  if (soloDisponibles.value) {
    filtroDisponibilidadLocal.value = '';
  }
};

const limpiarFiltros = () => {
  busquedaLocal.value = '';
  filtroTipoDocumentoLocal.value = '';
  filtroDisponibilidadLocal.value = '';
  soloDisponibles.value = false;
};

// Watch para emitir cambios de madre seleccionada
watch(() => props.modelValue, (nuevoId) => {
  const madre = nuevoId ? madres.value.find(m => m.id_madre === nuevoId) || null : null;
  emit('madre-seleccionada', madre);
});

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    cargando.value = true;
    const [madresData, neonatosData] = await Promise.all([
      FirebaseService.getMadres(),
      FirebaseService.getNeonatos()
    ]);
    
    madres.value = madresData;
    neonatos.value = neonatosData;
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    cargando.value = false;
  }
});
</script>
