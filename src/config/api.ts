// Configuración de la API
export const API_CONFIG = {
  HOSTNAME: 'neoidapp.infinityfreeapp.com',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Configuración de Axios
export const AXIOS_CONFIG = {
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para manejar errores de red
  validateStatus: (status: number) => status < 500,
};

// Función para detectar si estamos en HTTPS
export const isSecureContext = (): boolean => {
  return typeof window !== 'undefined' && window.isSecureContext;
};

// Función para probar si HTTPS está disponible
export const testHttpsAvailability = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(`https://${API_CONFIG.HOSTNAME}/api/config.php`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('HTTPS no disponible, usando HTTP:', error);
    return false;
  }
};

// Función para obtener la URL base correcta según la disponibilidad
export const getApiBaseUrl = async (): Promise<string> => {
  if (typeof window !== 'undefined') {
    // Si estamos en HTTPS, intentar usar HTTPS para la API
    if (window.location.protocol === 'https:') {
      const httpsAvailable = await testHttpsAvailability();
      if (httpsAvailable) {
        return `https://${API_CONFIG.HOSTNAME}/api`;
      }
      console.warn('HTTPS no disponible para la API, usando HTTP');
    }
    
    // Usar el mismo protocolo que la página actual
    const protocol = window.location.protocol;
    return `${protocol}//${API_CONFIG.HOSTNAME}/api`;
  }
  
  // Fallback para SSR o Node.js - intentar HTTPS primero
  return `https://${API_CONFIG.HOSTNAME}/api`;
};

// Función síncrona para obtener URL base (para casos donde no se puede hacer async)
export const getApiBaseUrlSync = (): string => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    return `${protocol}//${API_CONFIG.HOSTNAME}/api`;
  }
  return `https://${API_CONFIG.HOSTNAME}/api`;
};
