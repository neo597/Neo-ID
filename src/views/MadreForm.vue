<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader
      :title="esEdicion ? 'Editar Madre' : 'Nueva Madre'"
      :show-back="true"
      :is-editing="esEdicion"
    />

    <div class="p-4">
      <!-- Stepper de pasos -->
      <FormStepper
        :steps="steps"
        :current-step="currentStep"
        :can-go-next="canGoNext"
        :can-go-back="canGoBack"
        :is-editing="esEdicion"
        @next="goToNext"
        @previous="goToPrevious"
        @finish="guardar"
      />

      <!-- Contenido del formulario -->
      <div class="mt-8">
        <!-- Paso 1: DataMatrix (Opcional) -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="bg-white rounded-lg p-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">DataMatrix Clínico</h3>
              <p class="text-gray-600">Escanea el código DataMatrix de la clínica (opcional)</p>
            </div>

            <QRIdScanner 
              v-model="form.qr_id" 
              placeholder="Escanear DataMatrix o ingresar ID de la clínica"
              :show-confirmation="true"
              @confirmed="onQRConfirmed"
            />

            <div class="mt-6 text-center">
              <button
                @click="skipQRStep"
                type="button"
                class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Omitir y continuar
              </button>
            </div>
          </div>
        </div>

        <!-- Paso 2: Datos de la Madre -->
        <div v-if="currentStep === 1" class="space-y-6">
          <div class="bg-white rounded-lg p-6 space-y-6">
            <h3 class="text-xl font-semibold text-gray-900">Información Personal</h3>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                v-model="form.nombre_madre"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nombre completo de la madre"
              />
            </div>

            <!-- Tipo y Número de Documento -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  v-model="form.tipo_documento"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar</option>
                  <option value="CEDULA CIUDADANIA">CÉDULA CIUDADANÍA</option>
                  <option value="TARJETA DE IDENTIDAD">TARJETA DE IDENTIDAD</option>
                  <option value="PPT">PPT</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Número de Documento *
                </label>
                <input
                  v-model="form.numero_documento"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Número de documento"
                />
              </div>
            </div>

            <!-- Servicio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Servicio en el que se encuentra *
              </label>
              <select
                v-model="form.servicio"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="observacion">Observación</option>
                <option value="habitacion">Habitación</option>
                <option value="cirugia">Cirugía</option>
                <option value="fuera_institucion">Fuera de la institución</option>
              </select>
            </div>

            <!-- Habitación (solo visible si servicio es "habitacion") -->
            <div v-if="form.servicio === 'habitacion'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Habitación *
              </label>
              <input
                v-model="form.habitacion"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Número o nombre de la habitación"
              />
            </div>

            <!-- Observaciones -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                v-model="form.observaciones"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Observaciones adicionales"
              ></textarea>
            </div>

            <!-- Estado -->
            <div class="flex items-center">
              <input
                v-model="form.estado"
                type="checkbox"
                id="estado"
                class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label for="estado" class="ml-2 text-sm font-medium text-gray-700">
                Estado Activo
              </label>
            </div>
          </div>
        </div>

        <!-- Paso 3: Confirmación -->
        <div v-if="currentStep === 2" class="space-y-6">
          <div class="bg-white rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Confirmación de Datos</h3>
            
            <!-- Resumen de datos -->
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Información Personal</h4>
                  <div class="space-y-1 text-sm">
                    <div><span class="text-gray-600">Nombre:</span> {{ form.nombre_madre }}</div>
                    <div><span class="text-gray-600">Documento:</span> {{ form.tipo_documento }} - {{ form.numero_documento }}</div>
                    <div><span class="text-gray-600">Servicio:</span> {{ getServicioLabel(form.servicio) }}</div>
                    <div v-if="form.habitacion"><span class="text-gray-600">Habitación:</span> {{ form.habitacion }}</div>
                    <div><span class="text-gray-600">Estado:</span> {{ form.estado ? 'Activo' : 'Inactivo' }}</div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">Información Adicional</h4>
                  <div class="space-y-1 text-sm">
                    <div><span class="text-gray-600">Fecha de Registro:</span> {{ form.fechaRegistro }}</div>
                    <div v-if="form.qr_id"><span class="text-gray-600">DataMatrix:</span> {{ form.qr_id }}</div>
                    <div v-if="form.observaciones"><span class="text-gray-600">Observaciones:</span> {{ form.observaciones }}</div>
                  </div>
                </div>
              </div>

              <!-- ID generado -->
              <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-primary-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span class="font-semibold text-primary-900">ID de la Madre</span>
                </div>
                <div class="text-lg font-mono text-primary-800">{{ generatedId || 'Se generará automáticamente' }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FirebaseService } from '../services/firebase.service';
import PageHeader from '../components/PageHeader.vue';
import FormStepper from '../components/FormStepper.vue';
import QRIdScanner from '../components/QRIdScanner.vue';

const router = useRouter();
const route = useRoute();

const esEdicion = ref(false);
const guardando = ref(false);
const currentStep = ref(0);
const generatedId = ref('');

const steps = [
  'DataMatrix Clínico',
  'Información Personal',
  'Confirmación'
];

const form = ref({
  nombre_madre: '',
  tipo_documento: '',
  numero_documento: '',
  servicio: '',
  habitacion: '',
  fechaRegistro: '',
  observaciones: '',
  estado: true,
  qr_id: '',
});

// Computed para validaciones
const canGoNext = computed(() => {
  if (currentStep.value === 0) return true; // Paso 1 es opcional
  if (currentStep.value === 1) {
    return form.value.nombre_madre.trim() !== '' &&
           form.value.tipo_documento !== '' &&
           form.value.numero_documento.trim() !== '' &&
           form.value.servicio !== '' &&
           (form.value.servicio !== 'habitacion' || form.value.habitacion.trim() !== '');
  }
  return true; // Paso 3 no necesita validación
});

const canGoBack = computed(() => {
  return currentStep.value > 0;
});

// Funciones de navegación
const goToNext = () => {
  if (canGoNext.value && currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const goToPrevious = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const skipQRStep = () => {
  currentStep.value = 1;
};

const onQRConfirmed = (value: string) => {
  form.value.qr_id = value;
  // Avanzar automáticamente al siguiente paso después de confirmar
  setTimeout(() => {
    goToNext();
  }, 500);
};

const getServicioLabel = (servicio: string) => {
  const labels: Record<string, string> = {
    'observacion': 'Observación',
    'habitacion': 'Habitación',
    'cirugia': 'Cirugía',
    'fuera_institucion': 'Fuera de la institución'
  };
  return labels[servicio] || servicio;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const madreData: any = {
      nombre_madre: form.value.nombre_madre,
      tipo_documento: form.value.tipo_documento,
      numero_documento: form.value.numero_documento,
      servicio: form.value.servicio,
      observaciones: form.value.observaciones || '',
      estado: form.value.estado,
    };

    // Solo agregar habitacion si tiene valor
    if (form.value.habitacion && form.value.habitacion.trim() !== '') {
      madreData.habitacion = form.value.habitacion;
    }

    // Solo agregar qr_id si tiene valor
    if (form.value.qr_id && form.value.qr_id.trim() !== '') {
      madreData.qr_id = form.value.qr_id;
    }
    
    if (esEdicion.value) {
      await FirebaseService.updateMadre(route.params.id as string, madreData);
    } else {
      await FirebaseService.addMadre(madreData);
    }
    router.push('/madres');
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar la madre');
  } finally {
    guardando.value = false;
  }
};

onMounted(async () => {
  // Establecer fecha actual
  form.value.fechaRegistro = new Date().toISOString().split('T')[0];
  
  if (route.params.id) {
    esEdicion.value = true;
    try {
      const madres = await FirebaseService.getMadres();
      const madre = madres.find(m => m.id_madre === route.params.id);
      if (madre) {
        form.value = {
          nombre_madre: madre.nombre_madre || '',
          tipo_documento: madre.tipo_documento || '',
          numero_documento: madre.numero_documento || '',
          servicio: madre.servicio || '',
          habitacion: madre.habitacion || '',
          fechaRegistro: madre.fecha || new Date().toISOString().split('T')[0],
          observaciones: madre.observaciones || '',
          estado: madre.estado,
          qr_id: madre.qr_id || '',
        };
        // En modo edición, ir directamente al paso 2
        currentStep.value = 1;
      }
    } catch (error) {
      console.error('Error al cargar madre:', error);
    }
  } else {
    // En modo creación, generar ID de preview
    try {
      generatedId.value = await FirebaseService.generateMadreId();
    } catch (error) {
      console.error('Error generando ID de preview:', error);
    }
  }
});
</script>