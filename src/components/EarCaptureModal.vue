<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] bg-black flex flex-col"
      @click.self="handleClose"
    >
      <!-- Canvas para partículas -->
      <canvas
        ref="particlesCanvas"
        class="absolute inset-0 pointer-events-none"
        :class="{ 'opacity-100': isScanning, 'opacity-0': !isScanning }"
      ></canvas>

      <!-- Header -->
      <div class="relative z-10 bg-black/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="handleClose"
            class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h2 class="text-white font-semibold text-lg">
              {{ currentEar === 'derecha' ? 'Oreja Derecha' : 'Oreja Izquierda' }}
            </h2>
            <p class="text-white/70 text-sm">
              Paso {{ currentEar === 'derecha' ? '1' : '2' }} de 2
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="isScanning"
            class="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-400/30"
          >
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span class="text-blue-300 text-sm font-medium">Escaneando</span>
          </div>
        </div>
      </div>

      <!-- Video Container -->
      <div class="flex-1 relative overflow-hidden">
        <!-- Video Stream (oculto cuando hay foto capturada) -->
        <video
          v-if="!capturedPhoto"
          ref="videoElement"
          autoplay
          playsinline
          class="w-full h-full object-cover"
          :class="{ 'scale-x-[-1]': facingMode === 'user' }"
        ></video>

        <!-- Overlay de guía para oreja (solo visible cuando NO hay foto capturada) -->
        <div v-if="!capturedPhoto" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <!-- Overlay oscuro alrededor del marco circular -->
          <svg class="absolute inset-0 w-full h-full" style="filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));">
            <defs>
              <mask :id="maskId">
                <rect width="100%" height="100%" fill="black"/>
                <circle cx="50%" cy="50%" r="140" fill="white"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" :mask="`url(#${maskId})`"/>
          </svg>
          
          <div class="relative z-10">
            <!-- Marco de captura circular con vista previa incrustada -->
            <div
              class="relative rounded-full shadow-2xl ring-4 ring-white/30 overflow-hidden"
              :class="currentEar === 'derecha' ? 'border-green-400' : 'border-blue-400'"
              style="width: 280px; height: 280px; border: 4px solid;"
            >
              <!-- Vista previa de la cámara dentro del marco circular -->
              <div class="absolute inset-0 rounded-full overflow-hidden">
                <video
                  ref="previewVideo"
                  autoplay
                  playsinline
                  class="w-full h-full object-cover"
                  :class="{ 'scale-x-[-1]': facingMode === 'user' }"
                  style="transform: scale(1.2);"
                ></video>
              </div>
              
              <!-- Borde del marco -->
              <div
                class="absolute inset-0 rounded-full pointer-events-none"
                :class="currentEar === 'derecha' ? 'border-green-400' : 'border-blue-400'"
                style="border: 3px solid; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.3);"
              ></div>
              
              <!-- Indicador de oreja en el centro -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  class="text-white font-bold text-4xl drop-shadow-2xl"
                  :class="currentEar === 'derecha' ? 'text-green-300' : 'text-blue-300'"
                  style="text-shadow: 0 0 20px rgba(0,0,0,0.8), 0 0 10px currentColor;"
                >
                  {{ currentEar === 'derecha' ? 'D' : 'I' }}
                </div>
              </div>
            </div>

            <!-- Instrucciones -->
            <div class="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center w-64">
              <p class="text-white text-sm font-medium mb-1 drop-shadow-lg">
                Coloca la oreja {{ currentEar === 'derecha' ? 'derecha' : 'izquierda' }} dentro del marco
              </p>
              <p class="text-white/80 text-xs drop-shadow">
                Asegúrate de que esté bien iluminada
              </p>
            </div>
          </div>
        </div>

        <!-- Indicador de foto capturada -->
        <div
          v-if="capturedPhoto"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <div class="text-center">
            <div class="mb-4">
              <img
                :src="capturedPhoto"
                alt="Foto capturada"
                class="max-w-sm max-h-96 rounded-lg shadow-2xl mx-auto"
              />
            </div>
            <p class="text-white text-lg font-medium mb-2">Foto capturada</p>
            <p class="text-white/70 text-sm">¿Deseas usar esta foto o tomar otra?</p>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="relative z-10 bg-black/80 backdrop-blur-sm px-4 py-6">
        <div class="flex items-center justify-center gap-4">
          <!-- Botón Volver -->
          <button
            v-if="capturedPhoto"
            @click="retakePhoto"
            class="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Retomar foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          <!-- Botón Capturar -->
          <button
            v-if="!capturedPhoto"
            @click="capturePhoto"
            :disabled="!isStreamReady || isLoading"
            class="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:border-gray-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl"
          >
            <div class="w-16 h-16 rounded-full bg-white"></div>
          </button>

          <!-- Botón Confirmar -->
          <button
            v-if="capturedPhoto"
            @click="confirmPhoto"
            :disabled="isLoading"
            class="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            title="Confirmar foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-7 h-7 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>

          <!-- Botón Cambiar Cámara -->
          <button
            v-if="!capturedPhoto"
            @click="switchCamera"
            :disabled="isLoading"
            class="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cambiar cámara"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <!-- Loading overlay -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <div class="text-center">
            <div class="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-white font-medium">{{ loadingMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'captured': [derecha: string | null, izquierda: string | null];
}>();

const isOpen = ref(false);
const videoElement = ref<HTMLVideoElement>();
const previewVideo = ref<HTMLVideoElement>();
const particlesCanvas = ref<HTMLCanvasElement>();
const isStreamReady = ref(false);
const isLoading = ref(false);
const loadingMessage = ref('');
const capturedPhoto = ref<string | null>(null);
const currentEar = ref<'derecha' | 'izquierda'>('derecha');
const facingMode = ref<'user' | 'environment'>('environment');
const isScanning = ref(false);

let stream: MediaStream | null = null;
let animationFrameId: number | null = null;
let particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}> = [];

const photoDerecha = ref<string | null>(null);
const photoIzquierda = ref<string | null>(null);
const maskId = ref(`circular-mask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

// Inicializar partículas
const initParticles = () => {
  if (!particlesCanvas.value) return;
  
  const canvas = particlesCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
};

// Animar partículas
const animateParticles = () => {
  if (!particlesCanvas.value || !isScanning.value) return;

  const canvas = particlesCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    // Movimiento fluido
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Rebote en los bordes
    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

    // Mantener dentro del canvas
    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
    particle.y = Math.max(0, Math.min(canvas.height, particle.y));

    // Dibujar partícula
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`; // Azul
    ctx.fill();

    // Efecto de estela
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity * 0.2})`;
    ctx.fill();
  });

  animationFrameId = requestAnimationFrame(animateParticles);
};

// Iniciar cámara
const startCamera = async () => {
  try {
    isLoading.value = true;
    loadingMessage.value = 'Iniciando cámara...';

    // Detener stream anterior si existe
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      await videoElement.value.play();
    }
    
    // También actualizar el video de preview si existe
    if (previewVideo.value) {
      previewVideo.value.srcObject = stream;
      await previewVideo.value.play();
    }
    
    isStreamReady.value = true;
    isScanning.value = true;
    await nextTick();
    initParticles();
    animateParticles();

    isLoading.value = false;
  } catch (error) {
    console.error('Error iniciando cámara:', error);
    isLoading.value = false;
    alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
  }
};

// Detener cámara
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  if (previewVideo.value) {
    previewVideo.value.srcObject = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  isStreamReady.value = false;
  isScanning.value = false;
};

// Cambiar cámara
const switchCamera = async () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  await startCamera();
};

// Capturar foto
const capturePhoto = () => {
  // Usar el video principal si está disponible, sino usar el preview
  const video = videoElement.value || previewVideo.value;
  
  if (!video || !isStreamReady.value || !stream) {
    console.warn('Video no disponible para captura');
    return;
  }

  // Verificar que el video tenga dimensiones válidas
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    console.warn('Video no tiene dimensiones válidas');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Si la cámara trasera está activa, voltear horizontalmente
  if (facingMode.value === 'environment') {
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  capturedPhoto.value = photoDataUrl;
  isScanning.value = false;
};

// Retomar foto
const retakePhoto = async () => {
  capturedPhoto.value = null;
  isScanning.value = true;
  // Asegurar que el video esté visible nuevamente
  await nextTick();
  if (videoElement.value && stream) {
    videoElement.value.srcObject = stream;
    await videoElement.value.play();
  }
  if (previewVideo.value && stream) {
    previewVideo.value.srcObject = stream;
    await previewVideo.value.play();
  }
  animateParticles();
};

// Confirmar foto
const confirmPhoto = () => {
  if (!capturedPhoto.value) return;

  if (currentEar.value === 'derecha') {
    photoDerecha.value = capturedPhoto.value;
    // Cambiar a oreja izquierda
    currentEar.value = 'izquierda';
    capturedPhoto.value = null; // Esto disparará el watcher que reconecta el video
    isScanning.value = true;
    
    // Reiniciar animación de partículas después de un pequeño delay
    setTimeout(() => {
      initParticles();
      animateParticles();
    }, 150);
  } else {
    photoIzquierda.value = capturedPhoto.value;
    // Finalizar captura
    emit('captured', photoDerecha.value, photoIzquierda.value);
    handleClose();
  }
};

// Cerrar modal
const handleClose = () => {
  stopCamera();
  isOpen.value = false;
  emit('update:modelValue', false);
  
  // Resetear estado
  capturedPhoto.value = null;
  currentEar.value = 'derecha';
  photoDerecha.value = null;
  photoIzquierda.value = null;
  isScanning.value = false;
};

// Watch para abrir/cerrar modal
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
  if (newValue) {
    nextTick(() => {
      startCamera();
    });
  } else {
    stopCamera();
  }
});

// Watch para reconectar el video cuando capturedPhoto cambia a null
watch(capturedPhoto, async (newValue) => {
  if (!newValue && stream && isStreamReady.value) {
    // Esperar un poco para que Vue actualice el DOM
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reconectar los videos al stream
    if (videoElement.value && stream) {
      videoElement.value.srcObject = stream;
      try {
        await videoElement.value.play();
      } catch (e) {
        console.warn('Error al reconectar video principal:', e);
      }
    }
    if (previewVideo.value && stream) {
      previewVideo.value.srcObject = stream;
      try {
        await previewVideo.value.play();
      } catch (e) {
        console.warn('Error al reconectar video preview:', e);
      }
    }
  }
});

// Manejar resize de ventana
const handleResize = () => {
  if (particlesCanvas.value) {
    particlesCanvas.value.width = window.innerWidth;
    particlesCanvas.value.height = window.innerHeight;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  if (props.modelValue) {
    isOpen.value = true;
    nextTick(() => {
      startCamera();
    });
  }
});

onUnmounted(() => {
  stopCamera();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
