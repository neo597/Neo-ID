<template>
  <div class="space-y-4">
    <!-- Header con título y contador -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <span class="text-sm text-gray-500">{{ fotos.length }} foto{{ fotos.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Grid de fotos -->
    <div v-if="fotos.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="(foto, index) in fotos"
        :key="index"
        class="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
        @click="openLightbox(index)"
      >
        <img
          :src="foto"
          :alt="`${title} ${index + 1}`"
          class="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        
        <!-- Overlay con botón eliminar -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <button
            v-if="allowDelete"
            @click.stop="deleteFoto(index)"
            class="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
            title="Eliminar foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-8 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 text-gray-300">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <p>No hay fotos disponibles</p>
    </div>

    <!-- Lightbox Modal -->
    <div
      v-if="lightboxOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      @click="closeLightbox"
    >
      <div class="relative max-w-4xl max-h-full p-4">
        <!-- Botón cerrar -->
        <button
          @click="closeLightbox"
          class="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Imagen principal -->
        <img
          :src="currentFoto"
          :alt="`${title} ${currentIndex + 1}`"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />

        <!-- Navegación -->
        <div v-if="fotos.length > 1" class="absolute inset-y-0 left-0 flex items-center">
          <button
            @click.stop="previousFoto"
            :disabled="currentIndex === 0"
            class="bg-black bg-opacity-50 text-white p-2 rounded-r-lg hover:bg-opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        <div v-if="fotos.length > 1" class="absolute inset-y-0 right-0 flex items-center">
          <button
            @click.stop="nextFoto"
            :disabled="currentIndex === fotos.length - 1"
            class="bg-black bg-opacity-50 text-white p-2 rounded-l-lg hover:bg-opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- Indicador de posición -->
        <div v-if="fotos.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {{ currentIndex + 1 }} / {{ fotos.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  fotos: string[];
  title: string;
  allowDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowDelete: false
});

const emit = defineEmits<{
  delete: [index: number];
}>();

const lightboxOpen = ref(false);
const currentIndex = ref(0);

const currentFoto = computed(() => {
  return props.fotos[currentIndex.value] || '';
});

const openLightbox = (index: number) => {
  currentIndex.value = index;
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
};

const nextFoto = () => {
  if (currentIndex.value < props.fotos.length - 1) {
    currentIndex.value++;
  }
};

const previousFoto = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const deleteFoto = (index: number) => {
  emit('delete', index);
};
</script>
