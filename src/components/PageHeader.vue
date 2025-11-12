<template>
  <header class="bg-blue-50 border-b border-blue-200 px-4 py-4 sticky top-0 z-40">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          @click="handleBack"
          class="p-2 -ml-2 text-blue-900 active:bg-blue-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div class="flex items-center gap-3">
          <img 
            :src="logoUvig" 
            alt="UNAB" 
            class="h-8 w-auto"
          />
          <img 
            :src="logoNeoId" 
            alt="NeoID Logo" 
            class="h-8 w-8 rounded-full object-cover border-2 border-blue-400"
          />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-blue-900">{{ title }}</h1>
              <span 
                v-if="isEditing" 
                class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
              >
                Editando
              </span>
            </div>
            <p v-if="subtitle" class="text-sm text-blue-700">{{ subtitle }}</p>
          </div>
        </div>
      </div>
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import logoUvig from '../images/logo-u-vig.png';
import logoNeoId from '../images/PHOTO-2025-10-13-09-58-23.jpg';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  projectLogo?: string;
  isEditing?: boolean;
}

defineProps<Props>();

const router = useRouter();

const handleBack = () => {
  router.back();
};
</script>
