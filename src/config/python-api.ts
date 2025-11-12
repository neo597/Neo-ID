// Configuración de la API Python para reconocimiento de orejas
export const PYTHON_API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // URL base del servidor Python
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Configuración de Axios para la API Python
export const PYTHON_AXIOS_CONFIG = {
  timeout: PYTHON_API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para manejar errores de red
  validateStatus: (status: number) => status < 500,
};

// Función para obtener la URL base de la API Python
export const getPythonApiBaseUrl = (): string => {
  return PYTHON_API_CONFIG.BASE_URL;
};



