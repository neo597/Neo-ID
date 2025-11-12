<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader
      :title="esEdicion ? 'Editar Neonato' : 'Nuevo Neonato'"
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
        <!-- Paso 1: DataMatrix + Madre -->
        <div v-if="currentStep === 0" class="space-y-6">
          <!-- DataMatrix Clínico -->
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
          </div>

          <!-- Selección de Madre -->
          <div class="bg-white rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Madre del Neonato</h3>
            
            <MadreSelector
              v-model="form.id_madre"
              label="Madre *"
              placeholder="Buscar por nombre o documento..."
              :required="true"
              @madre-seleccionada="onMadreSeleccionada"
            />
          </div>
        </div>

        <!-- Paso 2: Datos Básicos + Medidas -->
        <div v-if="currentStep === 1" class="space-y-6">
          <!-- Información Básica -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <h3 class="text-xl font-semibold text-gray-900">Información del Neonato</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Neonato *
              </label>
              <input
                v-model="form.nombre_neonato"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nombre completo"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  v-model="form.fecha_nacimiento"
                  type="date"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Hora *
                </label>
                <input
                  v-model="form.hora_nacimiento"
                  type="time"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <select
                v-model="form.sexo"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          <!-- Medidas Antropométricas -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <h3 class="text-xl font-semibold text-gray-900">Medidas Antropométricas</h3>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Peso (g) *
                </label>
                <input
                  v-model="form.peso"
                  type="number"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="3500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Talla (cm) *
                </label>
                <input
                  v-model="form.talla"
                  type="number"
                  step="0.1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  PC (cm) *
                </label>
                <input
                  v-model="form.pc"
                  type="number"
                  step="0.1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="35"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  PA (cm) *
                </label>
                <input
                  v-model="form.pa"
                  type="number"
                  step="0.1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="32"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  PT (cm) *
                </label>
                <input
                  v-model="form.pt"
                  type="number"
                  step="0.1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="33"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 3: Información Clínica + Fotos -->
        <div v-if="currentStep === 2" class="space-y-6">
          <!-- Información Clínica -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <h3 class="text-xl font-semibold text-gray-900">Información Clínica</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Permeabilidad Rectal *
              </label>
              <select
                v-model="form.permeabilidad_rectal"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <input
                  v-model="form.servicio"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Neonatología"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Se Encuentra En *
                </label>
                <input
                  v-model="form.se_encuentra_en"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: UCI Neonatal"
                />
              </div>
            </div>

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

          <!-- Fotos de Orejas -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900">Fotos de Orejas</h3>
              </div>
              
              <!-- Checkbox para activar/desactivar fotos de orejas -->
              <div class="flex items-center gap-2">
                <input
                  v-model="subirFotosOrejas"
                  type="checkbox"
                  id="subirFotosOrejas"
                  class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label for="subirFotosOrejas" class="text-sm font-medium text-gray-700">
                  Subir fotos de orejas
                </label>
              </div>
            </div>
            
            <!-- Secciones de fotos solo se muestran si el checkbox está activado -->
            <div v-if="subirFotosOrejas" class="space-y-6">
              <!-- Botón para abrir modal de captura -->
              <div class="flex justify-center">
                <button
                  @click="openEarCaptureModal"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:from-blue-700 hover:to-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  Capturar Fotos de Orejas
                </button>
              </div>

              <!-- Oreja Derecha -->
              <div v-if="fotosOrejaDerecha.length > 0" class="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-bold text-green-600">D</span>
                    </div>
                    <label class="text-sm font-medium text-gray-700">
                      Oreja Derecha
                    </label>
                  </div>
                  <span class="text-xs text-gray-500">{{ fotosOrejaDerecha.length }} foto{{ fotosOrejaDerecha.length !== 1 ? 's' : '' }}</span>
                </div>
                
                <!-- Previsualización de fotos oreja derecha -->
                <FotoGallery
                  :fotos="fotosOrejaDerecha"
                  title="Oreja Derecha"
                  :allow-delete="true"
                  @delete="deleteOrejaDerechaFoto"
                />
              </div>

              <!-- Oreja Izquierda -->
              <div v-if="fotosOrejaIzquierda.length > 0" class="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-bold text-blue-600">I</span>
                    </div>
                    <label class="text-sm font-medium text-gray-700">
                      Oreja Izquierda
                    </label>
                  </div>
                  <span class="text-xs text-gray-500">{{ fotosOrejaIzquierda.length }} foto{{ fotosOrejaIzquierda.length !== 1 ? 's' : '' }}</span>
                </div>
                
                <!-- Previsualización de fotos oreja izquierda -->
                <FotoGallery
                  :fotos="fotosOrejaIzquierda"
                  title="Oreja Izquierda"
                  :allow-delete="true"
                  @delete="deleteOrejaIzquierdaFoto"
                />
              </div>

              <!-- Mensaje cuando no hay fotos -->
              <div v-if="fotosOrejaDerecha.length === 0 && fotosOrejaIzquierda.length === 0" class="text-center py-8">
                <p class="text-gray-500 text-sm">Toca el botón arriba para capturar las fotos de las orejas</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal de captura de orejas -->
    <EarCaptureModal
      v-model="showEarCaptureModal"
      @captured="handleEarPhotosCaptured"
    />

    <!-- Modal de confirmación -->
    <div
      v-if="modalConfirmacion"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click="cerrarModalConfirmacion"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        @click.stop
      >
        <!-- Header del modal -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">¡Neonato Guardado Exitosamente!</h2>
              <p class="text-sm text-gray-600">El neonato ha sido registrado correctamente</p>
            </div>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <div class="bg-pink-50/50 rounded-xl p-4 border border-pink-100 mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">{{ neonatoConfirmacion?.nombre_neonato }}</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-600">Fecha:</span>
                <span class="font-medium text-gray-900">{{ formatDate(neonatoConfirmacion?.fecha_nacimiento) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Hora:</span>
                <span class="font-medium text-gray-900">{{ neonatoConfirmacion?.hora_nacimiento }}</span>
              </div>
              <div>
                <span class="text-gray-600">Peso:</span>
                <span class="font-medium text-gray-900">{{ neonatoConfirmacion?.peso }}g</span>
              </div>
              <div>
                <span class="text-gray-600">Sexo:</span>
                <span class="font-medium text-gray-900">{{ neonatoConfirmacion?.sexo }}</span>
              </div>
            </div>
          </div>

          <div v-if="neonatoConfirmacion?.id_madre" class="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h4 class="font-semibold text-gray-900 mb-2">Madre Relacionada</h4>
            <p class="text-sm text-gray-600">ID: {{ neonatoConfirmacion.id_madre }}</p>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div class="flex justify-end gap-3">
            <button
              @click="cerrarModalConfirmacion"
              class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FirebaseService } from '../services/firebase.service';
import { PhotoService } from '../services/photo.service';
import type { Madre, Neonato } from '../types/models';
import PageHeader from '../components/PageHeader.vue';
import FormStepper from '../components/FormStepper.vue';
import FotoGallery from '../components/FotoGallery.vue';
import QRIdScanner from '../components/QRIdScanner.vue';
import MadreSelector from '../components/MadreSelector.vue';
import EarCaptureModal from '../components/EarCaptureModal.vue';

const router = useRouter();
const route = useRoute();

const esEdicion = ref(false);
const guardando = ref(false);
const currentStep = ref(0);

const steps = [
  'DataMatrix + Madre',
  'Datos Básicos + Medidas',
  'Información Clínica + Fotos'
];

// Variables para manejo de fotos
const subirFotosOrejas = ref(false);
const fotosOrejaDerecha = ref<string[]>([]);
const fotosOrejaIzquierda = ref<string[]>([]);
const showEarCaptureModal = ref(false);

// Variables para el modal de confirmación
const modalConfirmacion = ref(false);
const neonatoConfirmacion = ref<Neonato | null>(null);

const form = ref({
  nombre_neonato: '',
  id_madre: '',
  fecha_nacimiento: '',
  hora_nacimiento: '',
  sexo: '',
  talla: '',
  peso: '',
  pc: '',
  pa: '',
  pt: '',
  permeabilidad_rectal: '',
  servicio: '',
  se_encuentra_en: '',
  observaciones: '',
  estado: true,
  qr_id: '',
});

// Computed para validaciones
const canGoNext = computed(() => {
  if (currentStep.value === 0) {
    return form.value.id_madre !== '';
  }
  if (currentStep.value === 1) {
    return form.value.nombre_neonato.trim() !== '' &&
           form.value.fecha_nacimiento !== '' &&
           form.value.hora_nacimiento !== '' &&
           form.value.sexo !== '' &&
           form.value.peso !== '' &&
           form.value.talla !== '' &&
           form.value.pc !== '' &&
           form.value.pa !== '' &&
           form.value.pt !== '';
  }
  if (currentStep.value === 2) {
    return form.value.permeabilidad_rectal !== '' &&
           form.value.servicio.trim() !== '' &&
           form.value.se_encuentra_en.trim() !== '';
  }
  return true;
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

const onQRConfirmed = (value: string) => {
  form.value.qr_id = value;
  // Avanzar automáticamente al siguiente paso después de confirmar
  setTimeout(() => {
    goToNext();
  }, 500);
};

const onMadreSeleccionada = (madre: Madre | null) => {
  console.log('Madre seleccionada:', madre);
};

const guardar = async () => {
  guardando.value = true;
  try {
    let neonatoId: string;
    if (esEdicion.value) {
      await FirebaseService.updateNeonato(route.params.id as string, form.value);
      neonatoId = route.params.id as string;
    } else {
      neonatoId = await FirebaseService.addNeonato(form.value);
    }
    
    // Subir fotos al servidor PHP solo si el checkbox está activado
    if (subirFotosOrejas.value) {
      const fotosDerechaUrls: string[] = [];
      const fotosIzquierdaUrls: string[] = [];
      
      try {
        // Subir fotos de oreja derecha
        for (const foto of fotosOrejaDerecha.value) {
          if (foto.startsWith('data:')) {
            // Convertir data URL a File
            const response = await fetch(foto);
            const blob = await response.blob();
            const file = new File([blob], `oreja_derecha_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const url = await PhotoService.uploadFotoOreja(file, neonatoId, 'derecha');
            fotosDerechaUrls.push(url);
          } else if (foto.startsWith('http')) {
            // Ya es una URL del servidor PHP
            fotosDerechaUrls.push(foto);
          }
        }
        
        // Subir fotos de oreja izquierda
        for (const foto of fotosOrejaIzquierda.value) {
          if (foto.startsWith('data:')) {
            // Convertir data URL a File
            const response = await fetch(foto);
            const blob = await response.blob();
            const file = new File([blob], `oreja_izquierda_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const url = await PhotoService.uploadFotoOreja(file, neonatoId, 'izquierda');
            fotosIzquierdaUrls.push(url);
          } else if (foto.startsWith('http')) {
            // Ya es una URL del servidor PHP
            fotosIzquierdaUrls.push(foto);
          }
        }
        
        // Actualizar el neonato con las URLs de las fotos
        if (fotosDerechaUrls.length > 0 || fotosIzquierdaUrls.length > 0) {
          const updateData: any = {};
          if (fotosDerechaUrls.length > 0) {
            updateData.fotos_oreja_derecha = fotosDerechaUrls;
          }
          if (fotosIzquierdaUrls.length > 0) {
            updateData.fotos_oreja_izquierda = fotosIzquierdaUrls;
          }
          await FirebaseService.updateNeonato(neonatoId, updateData);
          console.log('Fotos subidas exitosamente:', { fotosDerechaUrls, fotosIzquierdaUrls });
        }
      } catch (error) {
        console.error('Error subiendo fotos:', error);
        // Continuar con el guardado aunque falle la subida de fotos
        alert('El neonato se guardó correctamente, pero hubo un problema subiendo algunas fotos. Puedes intentar subirlas nuevamente editando el neonato.');
      }
    }
    
    // Cargar el neonato guardado para mostrar en el modal
    const neonatos = await FirebaseService.getNeonatos();
    const neonatoGuardado = neonatos.find(n => n.id_neonato === neonatoId);
    
    if (neonatoGuardado) {
      neonatoConfirmacion.value = neonatoGuardado;
      modalConfirmacion.value = true;
    } else {
      router.push('/neonatos');
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar el neonato');
  } finally {
    guardando.value = false;
  }
};

const cerrarModalConfirmacion = () => {
  modalConfirmacion.value = false;
  neonatoConfirmacion.value = null;
  router.push('/neonatos');
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

// Watcher para limpiar fotos cuando se desactive el checkbox
watch(subirFotosOrejas, (nuevoValor) => {
  if (!nuevoValor) {
    fotosOrejaDerecha.value = [];
    fotosOrejaIzquierda.value = [];
  }
});

// Funciones para manejo de fotos
const openEarCaptureModal = () => {
  showEarCaptureModal.value = true;
};

const handleEarPhotosCaptured = (fotoDerecha: string | null, fotoIzquierda: string | null) => {
  if (fotoDerecha) {
    fotosOrejaDerecha.value = [fotoDerecha];
  }
  if (fotoIzquierda) {
    fotosOrejaIzquierda.value = [fotoIzquierda];
  }
};

const deleteOrejaDerechaFoto = (index: number) => {
  fotosOrejaDerecha.value.splice(index, 1);
};

const deleteOrejaIzquierdaFoto = (index: number) => {
  fotosOrejaIzquierda.value.splice(index, 1);
};

onMounted(async () => {
  try {
    if (route.params.id) {
      esEdicion.value = true;
      const neonatos = await FirebaseService.getNeonatos();
      const neonato = neonatos.find(n => n.id_neonato === route.params.id);
      if (neonato) {
        form.value = {
          nombre_neonato: neonato.nombre_neonato,
          id_madre: neonato.id_madre,
          fecha_nacimiento: neonato.fecha_nacimiento,
          hora_nacimiento: neonato.hora_nacimiento,
          sexo: neonato.sexo,
          talla: neonato.talla,
          peso: neonato.peso,
          pc: neonato.pc,
          pa: neonato.pa,
          pt: neonato.pt,
          permeabilidad_rectal: neonato.permeabilidad_rectal,
          servicio: neonato.servicio,
          se_encuentra_en: neonato.se_encuentra_en,
          observaciones: neonato.observaciones || '',
          estado: neonato.estado,
          qr_id: neonato.qr_id || '',
        };
        
        // Cargar fotos existentes y activar checkbox si hay fotos
        fotosOrejaDerecha.value = neonato.fotos_oreja_derecha || [];
        fotosOrejaIzquierda.value = neonato.fotos_oreja_izquierda || [];
        
        // Activar checkbox si hay fotos existentes
        if (fotosOrejaDerecha.value.length > 0 || fotosOrejaIzquierda.value.length > 0) {
          subirFotosOrejas.value = true;
        }
        
        // En modo edición, ir directamente al paso 2
        currentStep.value = 1;
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
});
</script>