import { generateDataMatrixDataUrl } from '../utils/datamatrix';

export interface QRData {
  madreId: string;
  madreDocumento: string;
  neonatoId: string;
  neonatoNombre: string;
  timestamp: string;
}

export class QRService {
  static async generateQR(data: QRData): Promise<string> {
    try {
      const qrString = JSON.stringify(data);
      const dataUrl = generateDataMatrixDataUrl(qrString);
      if (!dataUrl) {
        throw new Error('No se pudo generar el Data Matrix');
      }
      return dataUrl;
    } catch (error) {
      console.error('Error generando Data Matrix:', error);
      throw error;
    }
  }
  
  static decodeQR(qrString: string): QRData {
    try {
      return JSON.parse(qrString);
    } catch (error) {
      console.error('Error decodificando Data Matrix:', error);
      throw new Error('QR inválido');
    }
  }

  static generateQRData(madreId: string, madreDocumento: string, neonatoId: string, neonatoNombre: string): QRData {
    return {
      madreId,
      madreDocumento,
      neonatoId,
      neonatoNombre,
      timestamp: new Date().toISOString()
    };
  }

  static decodeQROrId(qrString: string): QRData | { id: string } {
    try {
      const parsed = JSON.parse(qrString);
      // Verificar si tiene la estructura de QRData
      if (parsed.madreId && parsed.neonatoId) {
        return parsed as QRData;
      }
      return { id: qrString }; // No es un QR del sistema
    } catch {
      return { id: qrString }; // DataMatrix pre-impreso o texto simple
    }
  }

  static isSystemQR(qrData: QRData | { id: string }): qrData is QRData {
    return 'madreId' in qrData && 'neonatoId' in qrData;
  }
}
