export interface Neonato {
  id_neonato: string;
  id_madre: string;
  nombre_neonato: string;
  fecha_nacimiento: string;
  hora_nacimiento: string;
  sexo: string;
  talla: string;
  peso: string;
  pc: string;
  pa: string;
  pt: string;
  permeabilidad_rectal: string;
  servicio: string;
  se_encuentra_en: string;
  observaciones?: string;
  estado: boolean;
  fecha: string;
  fotos_oreja_derecha?: string[];  // URLs de Firebase Storage
  fotos_oreja_izquierda?: string[]; // URLs de Firebase Storage
  qr_code?: string; // URL del QR generado por el sistema
  qr_id?: string; // ID del DataMatrix pre-impreso de la clínica
}

export interface Madre {
  id_madre: string;
  nombre_madre: string;
  tipo_documento: string;
  numero_documento: string;
  servicio: string;
  habitacion?: string;
  observaciones?: string;
  estado: boolean;
  fecha: string;
  qr_id?: string; // ID del DataMatrix pre-impreso de la clínica
}

export interface Llanto {
  id_llanto?: string;
  id_neonato: string;
  duracion: string;
  fecha: string;
}

export interface Estadisticas {
  neonatos: {
    total: number;
    activos: number;
    inactivos: number;
  };
  madres: {
    total: number;
    activas: number;
    inactivas: number;
  };
  llanto: {
    total: number;
  };
}

export interface FirebaseResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  count?: number;
}
