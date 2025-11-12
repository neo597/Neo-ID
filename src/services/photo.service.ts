import type { Madre, Neonato } from '../types/models';
import axios from 'axios';
import { getApiBaseUrl, getApiBaseUrlSync, AXIOS_CONFIG } from '../config/api';

// Variable para cachear la URL base
let cachedApiBaseUrl: string | null = null;

// Función para obtener la URL base de la API
const getApiUrl = async (): Promise<string> => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }
  
  try {
    cachedApiBaseUrl = await getApiBaseUrl();
    return cachedApiBaseUrl;
  } catch (error) {
    console.warn('Error obteniendo URL base, usando fallback:', error);
    cachedApiBaseUrl = getApiBaseUrlSync();
    return cachedApiBaseUrl;
  }
};

// Interfaces para las respuestas de la API
interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
  filename: string;
  neonato_id: string;
  tipo: string;
  count: number;
}

interface GetPhotosResponse {
  success: boolean;
  neonato_id: string;
  photos: {
    fotos_oreja_derecha: string[];
    fotos_oreja_izquierda: string[];
  };
  count_derecha: number;
  count_izquierda: number;
  total: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
  neonato_id: string;
  filename: string;
}

interface UploadLoteResult {
  exitosas: string[];
  fallidas: { foto: string; error: string }[];
}

export class PhotoService {
  /**
   * Subir una foto de oreja al servidor PHP
   */
  static async uploadFotoOreja(
    file: File, 
    neonatoId: string, 
    tipo: 'derecha' | 'izquierda'
  ): Promise<string> {
    try {
      // Obtener URL base de la API
      const apiBaseUrl = await getApiUrl();
      
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('id_neonato', neonatoId);
      formData.append('tipo', tipo);
      formData.append('imagen', file);

      // Realizar petición POST con Axios
      const response = await axios.post(`${apiBaseUrl}/upload-foto.php`, formData, {
        ...AXIOS_CONFIG,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data: UploadResponse = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Error subiendo imagen');
      }

      return data.url;
    } catch (error) {
      console.error('Error subiendo foto de oreja:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un código de error
          const errorData = error.response.data;
          throw new Error(errorData?.error || errorData?.message || 'Error del servidor');
        } else if (error.request) {
          // La petición se hizo pero no se recibió respuesta
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          // Algo pasó al configurar la petición
          throw new Error('Error configurando la petición');
        }
      }
      throw new Error('Error al subir la imagen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Obtener todas las fotos de un neonato
   */
  static async getFotosNeonato(neonatoId: string): Promise<{
    fotos_oreja_derecha: string[];
    fotos_oreja_izquierda: string[];
  }> {
    try {
      // Obtener URL base de la API
      const apiBaseUrl = await getApiUrl();
      
      const response = await axios.get(`${apiBaseUrl}/get-fotos.php`, {
        ...AXIOS_CONFIG,
        params: {
          id_neonato: neonatoId
        },
      });

      const data: GetPhotosResponse = response.data;
      
      if (!data.success) {
        throw new Error('Error obteniendo fotos del neonato');
      }

      return data.photos;
    } catch (error) {
      console.error('Error obteniendo fotos del neonato:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          console.error('Error del servidor:', errorData?.error || errorData?.message);
        } else if (error.request) {
          console.error('No se pudo conectar con el servidor');
        }
      }
      // Retornar arrays vacíos en caso de error
      return {
        fotos_oreja_derecha: [],
        fotos_oreja_izquierda: []
      };
    }
  }

  /**
   * Eliminar una foto específica
   */
  static async deleteFotoOreja(neonatoId: string, filename: string): Promise<void> {
    try {
      // Obtener URL base de la API
      const apiBaseUrl = await getApiUrl();
      
      const response = await axios.delete(`${apiBaseUrl}/delete-foto.php`, {
        ...AXIOS_CONFIG,
        data: {
          id_neonato: neonatoId,
          filename: filename
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: DeleteResponse = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Error eliminando foto');
      }
    } catch (error) {
      console.error('Error eliminando foto:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          throw new Error(errorData?.error || errorData?.message || 'Error del servidor');
        } else if (error.request) {
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          throw new Error('Error configurando la petición');
        }
      }
      throw new Error('Error al eliminar la imagen: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  /**
   * Subir múltiples fotos en lote
   */
  static async uploadLoteFotos(
    fotos: string[], 
    neonatoId: string, 
    lado: 'derecha' | 'izquierda'
  ): Promise<UploadLoteResult> {
    const exitosas: string[] = [];
    const fallidas: { foto: string; error: string }[] = [];

    // Procesar cada foto
    const uploadPromises = fotos.map(async (foto) => {
      try {
        if (this.isDataUrl(foto)) {
          // Convertir data URL a File
          const fileName = `oreja_${lado}_${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
          const file = this.dataUrlToFile(foto, fileName);
          const url = await this.uploadFotoOreja(file, neonatoId, lado);
          return { success: true, url, foto };
        } else if (foto.startsWith('http')) {
          // Ya es una URL del servidor PHP, mantenerla
          return { success: true, url: foto, foto };
        } else {
          throw new Error('Formato de foto no válido');
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Error desconocido',
          foto 
        };
      }
    });

    // Esperar a que terminen todas las subidas
    const results = await Promise.allSettled(uploadPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success && result.value.url) {
          exitosas.push(result.value.url);
        } else {
          fallidas.push({ 
            foto: fotos[index], 
            error: result.value.error || 'Error desconocido' 
          });
        }
      } else {
        fallidas.push({ 
          foto: fotos[index], 
          error: result.reason?.message || 'Error desconocido' 
        });
      }
    });

    return { exitosas, fallidas };
  }

  /**
   * Convertir data URL a File
   */
  static dataUrlToFile(dataUrl: string, fileName: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  /**
   * Verificar si es una data URL
   */
  static isDataUrl(url: string): boolean {
    return url.startsWith('data:');
  }

  /**
   * Comprimir imagen si es muy grande
   */
  static async compressImage(file: File, maxWidth: number = 1280, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob y luego a File
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Eliminar múltiples fotos
   */
  static async deleteMultipleFotos(urls: string[]): Promise<void> {
    const deletePromises = urls.map(async (url) => {
      try {
        // Extraer nombre de archivo de la URL
        const filename = url.split('/').pop();
        if (filename) {
          // Extraer neonatoId de la URL
          const urlParts = url.split('/');
          const neonatoIndex = urlParts.findIndex(part => part === 'neonatos');
          if (neonatoIndex !== -1 && urlParts[neonatoIndex + 1]) {
            const neonatoId = urlParts[neonatoIndex + 1];
            await this.deleteFotoOreja(neonatoId, filename);
          }
        }
      } catch (error) {
        console.warn('Error eliminando foto:', url, error);
      }
    });

    await Promise.allSettled(deletePromises);
  }
}
