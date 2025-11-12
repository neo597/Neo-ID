<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <div class="w-16 h-16 mb-4 text-gray-400">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </slot>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-500 mb-4">{{ message }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  message: string;
}

defineProps<Props>();
</script>
