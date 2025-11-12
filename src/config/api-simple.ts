// Configuración simple de la API que maneja servidores sin HTTPS
export const API_CONFIG_SIMPLE = {
  HOSTNAME: 'neoidapp.infinityfreeapp.com',
  TIMEOUT: 30000, // 30 segundos
};

// Función para obtener la URL base de forma simple
export const getApiBaseUrlSimple = (): string => {
  if (typeof window !== 'undefined') {
    // Si la página está en HTTPS, intentar usar HTTPS para la API
    if (window.location.protocol === 'https:') {
      return `https://${API_CONFIG_SIMPLE.HOSTNAME}/api`;
    }
    // Si la página está en HTTP, usar HTTP para la API
    return `http://${API_CONFIG_SIMPLE.HOSTNAME}/api`;
  }
  
  // Fallback: usar HTTP por defecto para servidores sin HTTPS
  return `http://${API_CONFIG_SIMPLE.HOSTNAME}/api`;
};

// Configuración de Axios simple
export const AXIOS_CONFIG_SIMPLE = {
  timeout: API_CONFIG_SIMPLE.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para manejar errores de red
  validateStatus: (status: number) => status < 500,
};
