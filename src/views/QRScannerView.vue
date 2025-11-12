<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <PageHeader title="Escanear Código QR" subtitle="Identificar madre y neonato" />
    
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              scanResult ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            ]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">Escaneo</span>
          </div>
          
          <div class="w-12 h-0.5 bg-gray-300"></div>
          
          <div class="flex items-center">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              foundData ? 'bg-green-500 text-white' : loadingData ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'
            ]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-700">Resultado</span>
          </div>
        </div>
      </div>

      <!-- Scanner Section -->
      <div v-if="!scanResult" class="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Escanear Código QR o DataMatrix</h2>
          <p class="text-gray-600 text-lg">Apunta la cámara al código QR del sistema o DataMatrix de la clínica</p>
        </div>

        <!-- Scanner Container -->
        <div class="relative">
          <div class="bg-gray-100 rounded-2xl p-4 mb-6">
            <QRScanner
              :width="400"
              :height="300"
              :show-instructions="false"
              :show-controls="true"
              :auto-start="true"
              @scan="handleQRScan"
              @error="handleScannerError"
            />
          </div>
          
          <!-- Scanner Overlay Instructions -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-blue-900 mb-2">Instrucciones de Escaneo</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Asegúrate de que el código esté bien iluminado</li>
                  <li>• Mantén la cámara estable y enfocada</li>
                  <li>• El código debe estar completamente visible en el marco</li>
                  <li>• Funciona con QR del sistema y DataMatrix de la clínica</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingData" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div class="animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 w-8 h-8"></div>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Buscando Información</h3>
        <p class="text-gray-600">Verificando datos en la base de datos...</p>
      </div>

      <!-- Results Section -->
      <div v-else-if="scanResult && foundData" class="space-y-6">
        <!-- Success Header -->
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-green-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Información Encontrada!</h3>
          <p class="text-gray-600">Se encontraron los datos del QR escaneado</p>
        </div>

        <!-- Madre Information Card -->
        <div v-if="foundData.madre" class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-bold text-white">Información de la Madre</h4>
                <p class="text-blue-100 text-sm">Datos personales y contacto</p>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.madre.nombre_madre }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Documento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.madre.tipo_documento }}: {{ foundData.madre.numero_documento }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Servicio</label>
                  <p class="text-lg font-semibold text-gray-900">{{ getServicioText(foundData.madre.servicio) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Estado</label>
                  <span :class="foundData.madre.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                    <div :class="foundData.madre.estado ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ foundData.madre.estado ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <button
                @click="viewMadreDetails"
                class="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver Detalles Completos de la Madre
              </button>
            </div>
          </div>
        </div>

        <!-- Neonato Information Card -->
        <div v-if="foundData.neonato" class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-bold text-white">Información del Neonato</h4>
                <p class="text-pink-100 text-sm">Datos del recién nacido</p>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Nombre</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.neonato.nombre_neonato }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ formatDate(foundData.neonato.fecha_nacimiento) }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Hora de Nacimiento</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.neonato.hora_nacimiento }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Peso y Talla</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.neonato.peso }}g - {{ foundData.neonato.talla }}cm</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Sexo</label>
                  <p class="text-lg font-semibold text-gray-900">{{ foundData.neonato.sexo === 'M' ? 'Masculino' : 'Femenino' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Estado</label>
                  <span :class="foundData.neonato.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                    <div :class="foundData.neonato.estado ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ foundData.neonato.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <button
                @click="viewNeonatoDetails"
                class="w-full bg-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver Detalles Completos del Neonato
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="resetScanner"
              class="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Nuevo Escaneo
            </button>
            <button
              @click="goToDashboard"
              class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- No Data Found -->
      <div v-else-if="scanResult && !foundData" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-yellow-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Información No Encontrada</h3>
        <p class="text-gray-600 mb-6 text-lg">Los datos del código escaneado no coinciden con registros en la base de datos</p>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-yellow-900 mb-2">Posibles Causas</h4>
              <ul class="text-sm text-yellow-800 space-y-1">
                <li>• El código no pertenece a este sistema</li>
                <li>• Los datos han sido eliminados de la base de datos</li>
                <li>• El código está dañado o es ilegible</li>
                <li>• El DataMatrix no está registrado en el sistema</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="resetScanner"
            class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Intentar Nuevamente
          </button>
          <button
            @click="goToDashboard"
            class="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>

    <MobileNav />
    
    <!-- QR Result Modal -->
    <QRResultModal
      :is-open="showModal"
      :data="modalData"
      @close="closeModal"
      @view-details="viewDetailsFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { FirebaseService } from '../services/firebase.service';
import { QRService, type QRData } from '../services/qr.service';
import PageHeader from '../components/PageHeader.vue';
import QRScanner from '../components/QRScanner.vue';
import QRResultModal from '../components/QRResultModal.vue';
import MobileNav from '../components/MobileNav.vue';

const router = useRouter();

const scanResult = ref<QRData | null>(null);
const foundData = ref<{ madre: any; neonato: any } | null>(null);
const loadingData = ref(false);
const showModal = ref(false);
const modalData = ref<{ madre: any; neonato: any; fotos?: { fotos_oreja_derecha: string[]; fotos_oreja_izquierda: string[] } } | null>(null);

const handleQRScan = async (qrData: QRData | string) => {
  scanResult.value = typeof qrData === 'string' ? null : qrData;
  loadingData.value = true;
  foundData.value = null;
  modalData.value = null;

  try {
    let searchDoc = '';
    let searchNeonatoId = '';
    let searchQrId = '';
    
    // Detectar tipo de código
    if (typeof qrData === 'string') {
      searchQrId = qrData; // DataMatrix pre-impreso
    } else {
      searchDoc = qrData.madreDocumento;
      searchNeonatoId = qrData.neonatoId;
    }
    
    // Si es un qr_id (DataMatrix), usar la nueva función de búsqueda
    if (searchQrId) {
      // 1) Buscar datos básicos rápido (sin fotos) y abrir modal inmediatamente
      const baseResult = await FirebaseService.findByQRId(searchQrId, false);
      foundData.value = { madre: baseResult.madre, neonato: baseResult.neonato };
      modalData.value = baseResult;

      if (baseResult.madre || baseResult.neonato) {
        showModal.value = true; // abrir modal rápido

        // 2) Cargar fotos en segundo plano y actualizar modal
        try {
          if (baseResult.neonato) {
            const fotos = await FirebaseService.getFotosNeonato(baseResult.neonato.id_neonato);
            modalData.value = { ...baseResult, fotos };
          }
        } catch (e) {
          console.warn('No se pudieron cargar fotos en segundo plano:', e);
        }
      }
    } else {
      // Búsqueda tradicional por documento e ID
      const [madres, neonatos] = await Promise.all([
        FirebaseService.getMadres(),
        FirebaseService.getNeonatos()
      ]);
      
      const madre = madres.find(m => 
        m.numero_documento === searchDoc || m.qr_id === searchQrId
      );
      
      const neonato = neonatos.find(n => 
        n.id_neonato === searchNeonatoId || n.qr_id === searchQrId
      );
      
      foundData.value = { madre, neonato };
      
      // Si se encontraron datos, también mostrar en modal
      if (madre || neonato) {
        modalData.value = { madre, neonato };
        showModal.value = true;
      }
    }
  } catch (error) {
    console.error('Error buscando datos:', error);
  } finally {
    loadingData.value = false;
  }
};

const handleScannerError = (error: string) => {
  console.error('Error del escáner:', error);
};

const resetScanner = () => {
  scanResult.value = null;
  foundData.value = null;
  loadingData.value = false;
  showModal.value = false;
  modalData.value = null;
};

const viewMadreDetails = () => {
  if (foundData.value?.madre) {
    router.push(`/madres/${foundData.value.madre.id_madre}`);
  }
};

const viewNeonatoDetails = () => {
  if (foundData.value?.neonato) {
    router.push(`/neonatos/${foundData.value.neonato.id_neonato}`);
  }
};

const closeModal = () => {
  showModal.value = false;
};

const viewDetailsFromModal = () => {
  if (modalData.value?.madre) {
    router.push(`/madres/${modalData.value.madre.id_madre}`);
  } else if (modalData.value?.neonato) {
    router.push(`/neonatos/${modalData.value.neonato.id_neonato}`);
  }
  showModal.value = false;
};

const goToDashboard = () => {
  router.push('/dashboard');
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
