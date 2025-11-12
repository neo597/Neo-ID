<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      @click.stop
    >
      <!-- Header del modal -->
      <div class="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
            <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6">
        <!-- Datos del registro a eliminar -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
          <h3 class="font-semibold text-gray-900 mb-2">
            {{ type === 'madre' ? 'Madre' : 'Neonato' }} a eliminar:
          </h3>
          <div class="text-sm text-gray-700">
            <div v-if="type === 'madre' && data">
              <p><strong>Nombre:</strong> {{ (data as any).nombre_madre }}</p>
              <p><strong>Documento:</strong> {{ (data as any).tipo_documento }}: {{ (data as any).numero_documento }}</p>
              <p><strong>Estado:</strong> {{ (data as any).estado ? 'Activa' : 'Inactiva' }}</p>
            </div>
            <div v-else-if="type === 'neonato' && data">
              <p><strong>Nombre:</strong> {{ (data as any).nombre_neonato }}</p>
              <p><strong>Fecha Nacimiento:</strong> {{ formatDate((data as any).fecha_nacimiento) }}</p>
              <p><strong>Peso:</strong> {{ (data as any).peso }}g</p>
              <p><strong>Estado:</strong> {{ (data as any).estado ? 'Activo' : 'Inactivo' }}</p>
            </div>
          </div>
        </div>

        <!-- Opciones de eliminación -->
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-3 block">Tipo de eliminación:</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="deleteType"
                  type="radio"
                  value="soft"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Desactivar</strong> - Cambiar estado a inactivo (reversible)
                </span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="deleteType"
                  type="radio"
                  value="hard"
                  class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Eliminar permanentemente</strong> - Borrar de la base de datos (irreversible)
                </span>
              </label>
            </div>
          </div>

          <!-- Checkbox de confirmación -->
          <div class="flex items-start">
            <input
              v-model="confirmCheckbox"
              type="checkbox"
              id="confirm-delete"
              class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
            />
            <label for="confirm-delete" class="ml-2 text-sm text-gray-700">
              Entiendo que esta acción {{ deleteType === 'hard' ? 'no se puede deshacer' : 'cambiará el estado a inactivo' }}
            </label>
          </div>

          <!-- Input de verificación para eliminación permanente -->
          <div v-if="deleteType === 'hard'" class="space-y-2">
            <label class="text-sm font-medium text-gray-700">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </label>
            <input
              v-model="confirmText"
              type="text"
              placeholder="Escribe ELIMINAR aquí"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Footer del modal -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div class="flex justify-end gap-3">
          <button
            @click="handleCancel"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleConfirm"
            :disabled="!canConfirm"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              deleteType === 'hard' 
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
            ]"
          >
            {{ deleteType === 'hard' ? 'Eliminar Permanentemente' : 'Desactivar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Madre, Neonato } from '../types/models';

interface Props {
  show: boolean;
  type: 'madre' | 'neonato';
  data: Madre | Neonato | null;
  hasSoftDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasSoftDelete: true
});

const emit = defineEmits<{
  confirm: [{ type: 'soft' | 'hard' }];
  cancel: [];
}>();

const deleteType = ref<'soft' | 'hard'>('soft');
const confirmCheckbox = ref(false);
const confirmText = ref('');

const canConfirm = computed(() => {
  if (!confirmCheckbox.value) return false;
  
  if (deleteType.value === 'hard') {
    return confirmText.value === 'ELIMINAR';
  }
  
  return true;
});

const handleConfirm = () => {
  if (canConfirm.value) {
    emit('confirm', { type: deleteType.value });
    resetForm();
  }
};

const handleCancel = () => {
  emit('cancel');
  resetForm();
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel();
  }
};

const resetForm = () => {
  deleteType.value = 'soft';
  confirmCheckbox.value = false;
  confirmText.value = '';
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'No especificado';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>
