// Interfaces para las respuestas de la API Python de reconocimiento de orejas

/**
 * Respuesta del análisis de un neonato
 */
export interface AnalyzeNeonatoResponse {
  success: boolean;
  analysis_id: string;
  photos_processed: number;
  total_features_extracted: number;
  neonate_id: string;
  detail?: string;
}

/**
 * Datos completos de un neonato (usado en reconocimiento)
 */
export interface NeonateData {
  id: string;
  nombre_neonato: string;
  fecha_nacimiento: string;
  hora_nacimiento: string;
  peso: number;
  talla: number;
  sexo: string;
  qr_id?: string;
  [key: string]: any; // Para otros campos que puedan existir
}

/**
 * Respuesta del reconocimiento de oreja cuando hay match
 */
export interface RecognizeEarMatchResponse extends RecognizeEarResponse {
  matched: true;
  neonate: NeonateData;
  confidence_percentage: number;
}

/**
 * Respuesta del reconocimiento de oreja cuando NO hay match
 */
export interface RecognizeEarNoMatchResponse extends RecognizeEarResponse {
  matched: false;
  best_similarity: number;
  threshold_required: number;
}

/**
 * Respuesta base del reconocimiento de oreja
 */
export interface RecognizeEarResponse {
  success: boolean;
  detail?: string;
}

/**
 * Tipo unión para la respuesta de reconocimiento
 */
export type RecognizeEarResponseType = RecognizeEarMatchResponse | RecognizeEarNoMatchResponse;

/**
 * Item de la lista de neonatos
 */
export interface NeonateListItem {
  id: string;
  nombre_neonato: string;
  fecha_nacimiento: string;
  has_ear_analysis: boolean;
  [key: string]: any; // Para otros campos que puedan existir
}

/**
 * Respuesta de la lista de neonatos
 */
export interface ListNeonatesResponse {
  success: boolean;
  neonates: NeonateListItem[];
}

/**
 * Resultado simplificado del reconocimiento de oreja
 * Usado cuando solo necesitas saber si hay match y los datos del neonato
 */
export interface RecognizeEarResult {
  matched: boolean;
  neonate: NeonateData | null;
  confidence_percentage: number | null;
  best_similarity: number | null;
  threshold_required: number | null;
}

