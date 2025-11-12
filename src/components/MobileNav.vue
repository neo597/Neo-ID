<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-blue-200 z-50 safe-area-bottom shadow-lg">
    <div class="flex justify-around items-center h-16 px-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="handleNavClick"
        class="flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-in-out relative group"
        :class="[
          isActive(item.path) 
            ? 'text-blue-600 scale-105' 
            : 'text-gray-600 hover:text-blue-500 hover:scale-105'
        ]"
      >
        <!-- Indicador activo con animación -->
        <div 
          v-if="isActive(item.path)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full active-indicator"
        ></div>
        
        <!-- Contenedor del icono con efecto de vibración -->
        <div 
          class="relative p-2 rounded-full transition-all duration-300 ripple"
          :class="[
            isActive(item.path) 
              ? 'bg-blue-100 shadow-md' 
              : 'group-hover:bg-blue-50 group-active:scale-95'
          ]"
        >
          <component 
            :is="item.icon" 
            class="w-6 h-6 transition-transform duration-300"
            :class="[
              isActive(item.path) 
                ? 'scale-110' 
                : 'group-hover:scale-105'
            ]"
          />
        </div>
        
        <!-- Label con animación -->
        <span 
          class="text-xs font-medium transition-all duration-300"
          :class="[
            isActive(item.path) 
              ? 'text-blue-600 font-semibold' 
              : 'group-hover:text-blue-500'
          ]"
        >
          {{ item.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Home, Users, Baby, QrCode, ScanLine } from 'lucide-vue-next';

const route = useRoute();

const navItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: Home,
  },
  {
    path: '/madres',
    label: 'Madres',
    icon: Users,
  },
  {
    path: '/neonatos',
    label: 'Neonatos',
    icon: Baby,
  },
  {
    path: '/qr-scanner',
    label: 'QR',
    icon: QrCode,
  },
  {
    path: '/ear-recognition',
    label: 'Reconocer',
    icon: ScanLine,
  },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

// Función para manejar la vibración táctil
const handleNavClick = () => {
  // Verificar si el navegador soporta vibración
  if ('vibrate' in navigator) {
    // Vibración corta y suave
    navigator.vibrate(50);
  }
  
  // Fallback: crear un efecto visual de "pulse" si no hay vibración
  const event = new CustomEvent('navFeedback', {
    detail: { type: 'pulse' }
  });
  window.dispatchEvent(event);
};
</script>

<style scoped>
/* Animaciones personalizadas para mejor feedback */
@keyframes navPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes activeIndicator {
  0% { opacity: 0.7; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1.1); }
  100% { opacity: 0.7; transform: scaleX(0.8); }
}

.nav-pulse {
  animation: navPulse 0.3s ease-in-out;
}

.active-indicator {
  animation: activeIndicator 2s ease-in-out infinite;
}

/* Mejorar el efecto de hover en dispositivos táctiles */
@media (hover: hover) {
  .group:hover .group-hover\:scale-105 {
    transform: scale(1.05);
  }
}

/* Efecto de ripple al tocar */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple:active::before {
  width: 300px;
  height: 300px;
}
</style>