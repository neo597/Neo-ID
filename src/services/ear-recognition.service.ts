import axios from 'axios';
import { getPythonApiBaseUrl, PYTHON_AXIOS_CONFIG } from '../config/python-api';
import type {
  AnalyzeNeonatoResponse,
  RecognizeEarResponseType,
  NeonateListItem,
  ListNeonatesResponse,
  RecognizeEarResult,
  RecognizeEarMatchResponse,
} from '../types/ear-recognition';

export class EarRecognitionService {
  /**
   * Analiza un neonato después de registrarlo
   * Procesa las fotos de orejas y extrae características para reconocimiento
   */
  static async analyzeNeonato(neonateId: string): Promise<AnalyzeNeonatoResponse> {
    try {
      const apiBaseUrl = getPythonApiBaseUrl();
      
      const response = await axios.post<AnalyzeNeonatoResponse>(
        `${apiBaseUrl}/api/analyze-neonate`,
        {
          neonate_id: neonateId,
        },
        PYTHON_AXIOS_CONFIG
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.detail || 'Error en el análisis del neonato');
      }

      return data;
    } catch (error) {
      console.error('Error analizando neonato:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          throw new Error(
            errorData?.detail || 
            errorData?.message || 
            'Error del servidor al analizar neonato'
          );
        } else if (error.request) {
          throw new Error(
            'No se pudo conectar con el servidor de reconocimiento. Verifica que el servidor Python esté ejecutándose.'
          );
        } else {
          throw new Error('Error configurando la petición de análisis');
        }
      }
      throw new Error(
        'Error al analizar neonato: ' + (error instanceof Error ? error.message : 'Error desconocido')
      );
    }
  }

  /**
   * Convierte un archivo File a base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result); // Ya incluye "data:image/jpeg;base64,..."
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convierte un canvas a base64
   */
  private static canvasToBase64(canvas: HTMLCanvasElement, quality: number = 0.9): string {
    return canvas.toDataURL('image/jpeg', quality);
  }

  /**
   * Reconoce una oreja desde un archivo de imagen
   */
  static async recognizeEarFromFile(imageFile: File): Promise<RecognizeEarResponseType> {
    try {
      // Validar que sea un archivo de imagen
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Convertir archivo a base64
      const base64Image = await this.fileToBase64(imageFile);

      return await this.recognizeEarFromBase64(base64Image);
    } catch (error) {
      console.error('Error reconociendo oreja desde archivo:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al reconocer oreja desde archivo');
    }
  }

  /**
   * Reconoce una oreja desde un canvas (captura de cámara)
   */
  static async recognizeEarFromCanvas(
    canvasElement: HTMLCanvasElement
  ): Promise<RecognizeEarResponseType> {
    try {
      // Validar que el canvas tenga dimensiones válidas
      if (canvasElement.width === 0 || canvasElement.height === 0) {
        throw new Error('El canvas no tiene dimensiones válidas');
      }

      // Convertir canvas a base64
      const base64Image = this.canvasToBase64(canvasElement, 0.9);

      return await this.recognizeEarFromBase64(base64Image);
    } catch (error) {
      console.error('Error reconociendo oreja desde canvas:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al reconocer oreja desde canvas');
    }
  }

  /**
   * Método interno para reconocer una oreja desde una imagen en base64
   */
  private static async recognizeEarFromBase64(
    base64Image: string
  ): Promise<RecognizeEarResponseType> {
    try {
      const apiBaseUrl = getPythonApiBaseUrl();

      const response = await axios.post<RecognizeEarResponseType>(
        `${apiBaseUrl}/api/recognize-ear`,
        {
          image_base64: base64Image,
        },
        PYTHON_AXIOS_CONFIG
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.detail || 'Error en el reconocimiento de oreja');
      }

      return data;
    } catch (error) {
      console.error('Error reconociendo oreja:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          throw new Error(
            errorData?.detail || 
            errorData?.message || 
            'Error del servidor al reconocer oreja'
          );
        } else if (error.request) {
          throw new Error(
            'No se pudo conectar con el servidor de reconocimiento. Verifica que el servidor Python esté ejecutándose.'
          );
        } else {
          throw new Error('Error configurando la petición de reconocimiento');
        }
      }
      throw new Error(
        'Error al reconocer oreja: ' + (error instanceof Error ? error.message : 'Error desconocido')
      );
    }
  }

  /**
   * Captura una foto de oreja desde un video element y reconoce al neonato
   * Método simplificado que retorna directamente el resultado del reconocimiento
   */
  static async recognizeNeonatoFromVideo(
    videoElement: HTMLVideoElement
  ): Promise<RecognizeEarResult> {
    try {
      // Validar que el video tenga dimensiones válidas
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        throw new Error('El video no tiene dimensiones válidas');
      }

      // Crear canvas para capturar el frame actual
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Error al obtener contexto del canvas');
      }

      // Capturar el frame actual del video
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Reconocer la oreja
      return await this.recognizeNeonatoFromCanvas(canvas);
    } catch (error) {
      console.error('Error reconociendo neonato desde video:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al reconocer neonato desde video');
    }
  }

  /**
   * Captura una foto de oreja desde un canvas y reconoce al neonato
   * Método simplificado que retorna directamente el resultado del reconocimiento
   */
  static async recognizeNeonatoFromCanvas(
    canvasElement: HTMLCanvasElement
  ): Promise<RecognizeEarResult> {
    try {
      const response = await this.recognizeEarFromCanvas(canvasElement);
      
      return this.parseRecognizeResponse(response);
    } catch (error) {
      console.error('Error reconociendo neonato desde canvas:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al reconocer neonato desde canvas');
    }
  }

  /**
   * Captura una foto de oreja desde un archivo y reconoce al neonato
   * Método simplificado que retorna directamente el resultado del reconocimiento
   */
  static async recognizeNeonatoFromFile(imageFile: File): Promise<RecognizeEarResult> {
    try {
      const response = await this.recognizeEarFromFile(imageFile);
      
      return this.parseRecognizeResponse(response);
    } catch (error) {
      console.error('Error reconociendo neonato desde archivo:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al reconocer neonato desde archivo');
    }
  }

  /**
   * Convierte la respuesta de reconocimiento en un formato simplificado
   */
  private static parseRecognizeResponse(
    response: RecognizeEarResponseType
  ): RecognizeEarResult {
    if (response.matched) {
      const matchResponse = response as RecognizeEarMatchResponse;
      return {
        matched: true,
        neonate: matchResponse.neonate,
        confidence_percentage: matchResponse.confidence_percentage,
        best_similarity: null,
        threshold_required: null,
      };
    } else {
      return {
        matched: false,
        neonate: null,
        confidence_percentage: null,
        best_similarity: response.best_similarity,
        threshold_required: response.threshold_required,
      };
    }
  }

  /**
   * Lista todos los neonatos registrados
   */
  static async listNeonates(): Promise<NeonateListItem[]> {
    try {
      const apiBaseUrl = getPythonApiBaseUrl();

      const response = await axios.get<ListNeonatesResponse>(
        `${apiBaseUrl}/api/neonates`,
        PYTHON_AXIOS_CONFIG
      );

      const data = response.data;

      if (!data.success) {
        throw new Error('Error al obtener la lista de neonatos');
      }

      return data.neonates;
    } catch (error) {
      console.error('Error listando neonatos:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          throw new Error(
            errorData?.detail || 
            errorData?.message || 
            'Error del servidor al listar neonatos'
          );
        } else if (error.request) {
          throw new Error(
            'No se pudo conectar con el servidor de reconocimiento. Verifica que el servidor Python esté ejecutándose.'
          );
        } else {
          throw new Error('Error configurando la petición de lista');
        }
      }
      throw new Error(
        'Error al listar neonatos: ' + (error instanceof Error ? error.message : 'Error desconocido')
      );
    }
  }
}

