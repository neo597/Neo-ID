<template>
  <div class="form-stepper">
    <!-- Indicadores de pasos -->
    <div class="stepper-header">
      <div class="steps-container">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :class="getStepClass(index)"
        >
          <!-- Círculo del paso -->
          <div class="step-circle">
            <div v-if="index < currentStep" class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div v-else-if="index === currentStep" class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          
          <!-- Línea conectora -->
          <div
            v-if="index < steps.length - 1"
            class="step-connector"
            :class="index < currentStep ? 'completed' : ''"
          ></div>
        </div>
      </div>
      
      <!-- Título del paso actual -->
      <div class="step-title">
        <h3 class="text-lg font-semibold text-gray-900">{{ steps[currentStep] }}</h3>
        <p class="text-sm text-gray-600">Paso {{ currentStep + 1 }} de {{ steps.length }}</p>
      </div>
    </div>

    <!-- Navegación -->
    <div class="stepper-navigation">
      <button
        v-if="currentStep > 0"
        @click="goToPrevious"
        type="button"
        class="btn-secondary"
        :disabled="!canGoBack"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Anterior
      </button>
      
      <div class="flex-1"></div>
      
      <button
        v-if="currentStep < steps.length - 1"
        @click="goToNext"
        type="button"
        class="btn-primary"
        :disabled="!canGoNext"
      >
        Siguiente
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      
      <button
        v-if="currentStep === steps.length - 1"
        @click="handleFinish"
        type="button"
        class="btn-success"
        :disabled="!canGoNext"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        {{ isEditing ? 'Actualizar' : 'Guardar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  steps: string[];
  currentStep: number;
  canGoNext?: boolean;
  canGoBack?: boolean;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canGoNext: true,
  canGoBack: true,
  isEditing: false
});

const emit = defineEmits<{
  next: [];
  previous: [];
  goToStep: [step: number];
  finish: [];
}>();

const getStepClass = (index: number) => {
  if (index < props.currentStep) return 'completed';
  if (index === props.currentStep) return 'current';
  return 'pending';
};

const goToNext = () => {
  emit('next');
};

const goToPrevious = () => {
  emit('previous');
};

const handleFinish = () => {
  emit('finish');
};
</script>

<style scoped>
.form-stepper {
  @apply w-full;
}

.stepper-header {
  @apply mb-8;
}

.steps-container {
  @apply flex items-center justify-center mb-4;
}

.step-item {
  @apply flex items-center;
}

.step-circle {
  @apply w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200;
}

.step-circle.completed {
  @apply bg-green-500 border-green-500 text-white;
}

.step-circle.current {
  @apply bg-primary-500 border-primary-500 text-white;
}

.step-circle.pending {
  @apply bg-gray-100 border-gray-300 text-gray-500;
}

.step-icon {
  @apply flex items-center justify-center;
}

.step-number {
  @apply text-sm font-semibold;
}

.step-connector {
  @apply w-16 h-0.5 bg-gray-300 transition-all duration-200;
}

.step-connector.completed {
  @apply bg-green-500;
}

.step-title {
  @apply text-center;
}

.stepper-navigation {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2;
}

.btn-success {
  @apply px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2;
}
</style>
