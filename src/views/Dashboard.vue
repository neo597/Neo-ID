<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader 
      title="NEO-ID" 
      subtitle="Sistema de Gestión Neonatal" 
    />

    <div class="p-4 space-y-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white">
        <div class="flex items-center gap-4 mb-4">
          <img 
            :src="logoNeoId" 
            alt="NeoID Logo" 
            class="h-12 w-12 rounded-full object-cover border-2 border-white/30 shadow-lg"
          />
          <div>
            <h2 class="text-2xl font-bold">Bienvenido</h2>
            <p class="text-blue-100">Sistema integral de gestión neonatal</p>
          </div>
        </div>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">Estadísticas</h3>
          <div class="grid grid-cols-2 gap-3">
            <router-link
              to="/madres"
              class="bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ estadisticas.madres.total }}</div>
              <div class="text-sm text-gray-600">Madres</div>
              <div class="mt-2 flex gap-2 text-xs">
                <span class="text-green-600">{{ estadisticas.madres.activas }} activas</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-500">{{ estadisticas.madres.inactivas }} inactivas</span>
              </div>
            </router-link>

            <router-link
              to="/neonatos"
              class="bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                  </svg>
                </div>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ estadisticas.neonatos.total }}</div>
              <div class="text-sm text-gray-600">Neonatos</div>
              <div class="mt-2 flex gap-2 text-xs">
                <span class="text-green-600">{{ estadisticas.neonatos.activos }} activos</span>
                <span class="text-gray-400">•</span>
                <span class="text-gray-500">{{ estadisticas.neonatos.inactivos }} inactivos</span>
              </div>
            </router-link>
          </div>
        </div>


        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase mb-3">Acciones Rápidas</h3>
          <div class="space-y-2">
            <router-link
              to="/madres/nueva"
              class="flex items-center gap-3 bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Nueva Madre</div>
                <div class="text-sm text-gray-500">Registrar nueva madre</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </router-link>

            <router-link
              to="/neonatos/nuevo"
              class="flex items-center gap-3 bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Nuevo Neonato</div>
                <div class="text-sm text-gray-500">Registrar nuevo neonato</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </router-link>

            <router-link
              to="/admin"
              class="flex items-center gap-3 bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 1-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m-3.75 0H7.5m0-12H3.375c-.621 0-1.125.504-1.125 1.125v18.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Administración</div>
                <div class="text-sm text-gray-500">Ver base de datos</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </router-link>

            <router-link
              to="/herramientas/datamatrix"
              class="flex items-center gap-3 bg-white rounded-lg p-4 active:bg-blue-50 transition-colors border border-blue-100 hover:border-blue-200"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5h15v15h-15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6v6H9z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Generar Data Matrix</div>
                <div class="text-sm text-gray-500">Crear lotes de códigos únicos</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FirebaseService } from '../services/firebase.service';
import type { Estadisticas } from '../types/models';
import PageHeader from '../components/PageHeader.vue';
import MobileNav from '../components/MobileNav.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import logoNeoId from '../images/PHOTO-2025-10-13-09-58-23.jpg';

const loading = ref(true);
const estadisticas = ref<Estadisticas>({
  madres: { total: 0, activas: 0, inactivas: 0 },
  neonatos: { total: 0, activos: 0, inactivos: 0 },
  llanto: { total: 0 },
});

const cargarEstadisticas = async () => {
  loading.value = true;
  try {
    estadisticas.value = await FirebaseService.getEstadisticas();
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarEstadisticas();
});
</script>
