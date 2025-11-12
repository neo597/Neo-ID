import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { getDoc, limit } from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Madre, Neonato, Estadisticas } from '../types/models';

export class FirebaseService {
  // Generar ID único para madre con formato M-YYYYMMDD-###
  static async generateMadreId(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `M-${dateStr}-`;
    
    try {
      // Buscar el último ID del día
      const q = query(
        collection(db, 'madres'),
        where('id_madre', '>=', prefix),
        where('id_madre', '<', `M-${dateStr}-999`),
        orderBy('id_madre', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Primer registro del día
        return `${prefix}001`;
      } else {
        // Obtener el último número y incrementar
        const lastId = snapshot.docs[0].data().id_madre as string;
        const lastNumber = parseInt(lastId.split('-')[2]);
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        return `${prefix}${nextNumber}`;
      }
    } catch (error) {
      console.error('Error generando ID de madre:', error);
      // Fallback: usar timestamp
      return `${prefix}${Date.now().toString().slice(-3)}`;
    }
  }

  static async addMadre(madre: Omit<Madre, 'id_madre' | 'fecha'>): Promise<string> {
    // Generar ID automáticamente
    const id_madre = await this.generateMadreId();
    
    const docRef = await addDoc(collection(db, 'madres'), {
      ...madre,
      id_madre,
      fecha: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getMadres(estadoFilter?: boolean): Promise<Madre[]> {
    try {
      let snapshot;
      
      if (estadoFilter !== undefined) {
        // Intentar consulta con filtro y ordenamiento
        try {
          const q = query(collection(db, 'madres'), where('estado', '==', estadoFilter), orderBy('fecha', 'desc'));
          snapshot = await getDocs(q);
        } catch (error) {
          // Si falla por falta de índice, hacer consulta sin orderBy y ordenar en el cliente
          console.warn('Índice compuesto no encontrado, ordenando en el cliente');
          const q = query(collection(db, 'madres'), where('estado', '==', estadoFilter));
          snapshot = await getDocs(q);
        }
      } else {
        // Sin filtro, solo ordenar
        const q = query(collection(db, 'madres'), orderBy('fecha', 'desc'));
        snapshot = await getDocs(q);
      }

      let madres = snapshot.docs.map(doc => ({
        id_madre: doc.id,
        ...doc.data()
      } as Madre));

      // Si no se pudo ordenar en Firebase, ordenar en el cliente
      if (estadoFilter !== undefined) {
        madres = madres.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }

      return madres;
    } catch (error) {
      console.error('Error obteniendo madres:', error);
      // Fallback: obtener todas las madres y filtrar/ordenar en el cliente
      const q = query(collection(db, 'madres'));
      const snapshot = await getDocs(q);
      let madres = snapshot.docs.map(doc => ({
        id_madre: doc.id,
        ...doc.data()
      } as Madre));

      // Filtrar por estado si es necesario
      if (estadoFilter !== undefined) {
        madres = madres.filter(madre => madre.estado === estadoFilter);
      }

      // Ordenar por fecha
      madres = madres.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      return madres;
    }
  }

  static async updateMadre(id: string, data: Partial<Madre>): Promise<void> {
    const docRef = doc(db, 'madres', id);
    await updateDoc(docRef, data);
  }

  static async searchMadres(searchTerm: string, filters?: {
    tipoDocumento?: string;
    estado?: boolean;
    disponibilidad?: 'disponible' | 'ocupada';
  }): Promise<Madre[]> {
    let q = query(collection(db, 'madres'), orderBy('fecha', 'desc'));

    // Aplicar filtro de estado si se especifica
    if (filters?.estado !== undefined) {
      q = query(collection(db, 'madres'), where('estado', '==', filters.estado), orderBy('fecha', 'desc'));
    }

    // Aplicar filtro de tipo de documento si se especifica
    if (filters?.tipoDocumento) {
      q = query(collection(db, 'madres'), 
        where('tipo_documento', '==', filters.tipoDocumento),
        orderBy('fecha', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    let madres = snapshot.docs.map(doc => ({
      id_madre: doc.id,
      ...doc.data()
    } as Madre));

    // Filtrar por término de búsqueda en el cliente (Firebase no soporta búsqueda de texto completo)
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim();
      madres = madres.filter(madre => 
        madre.nombre_madre.toLowerCase().includes(termino) ||
        madre.numero_documento.toLowerCase().includes(termino)
      );
    }

    // Si se requiere filtro de disponibilidad, obtener neonatos
    if (filters?.disponibilidad) {
      const neonatos = await this.getNeonatos(true); // Solo neonatos activos
      const madresConNeonatos = new Set(neonatos.map(n => n.id_madre));

      if (filters.disponibilidad === 'disponible') {
        madres = madres.filter(madre => !madresConNeonatos.has(madre.id_madre));
      } else if (filters.disponibilidad === 'ocupada') {
        madres = madres.filter(madre => madresConNeonatos.has(madre.id_madre));
      }
    }

    return madres;
  }

  static async getMadresDisponibles(): Promise<Madre[]> {
    const [madres, neonatos] = await Promise.all([
      this.getMadres(true), // Solo madres activas
      this.getNeonatos(true) // Solo neonatos activos
    ]);

    const madresConNeonatos = new Set(neonatos.map(n => n.id_madre));
    return madres.filter(madre => !madresConNeonatos.has(madre.id_madre));
  }

  static async getMadreConNeonatos(idMadre: string): Promise<{
    madre: Madre | null;
    neonatos: Neonato[];
    disponible: boolean;
  }> {
    const [madres, neonatos] = await Promise.all([
      this.getMadres(),
      this.getNeonatosByMadre(idMadre)
    ]);

    const madre = madres.find(m => m.id_madre === idMadre) || null;
    const neonatosActivos = neonatos.filter(n => n.estado);

    return {
      madre,
      neonatos: neonatosActivos,
      disponible: neonatosActivos.length === 0
    };
  }

  static async addNeonato(neonato: Omit<Neonato, 'id_neonato' | 'fecha'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'neonatos'), {
      ...neonato,
      fecha: new Date().toISOString(),
    });
    return docRef.id;
  }

  static async getNeonatos(estadoFilter?: boolean): Promise<Neonato[]> {
    try {
      let snapshot;
      
      if (estadoFilter !== undefined) {
        // Intentar consulta con filtro y ordenamiento
        try {
          const q = query(collection(db, 'neonatos'), where('estado', '==', estadoFilter), orderBy('fecha', 'desc'));
          snapshot = await getDocs(q);
        } catch (error) {
          // Si falla por falta de índice, hacer consulta sin orderBy y ordenar en el cliente
          console.warn('Índice compuesto no encontrado, ordenando en el cliente');
          const q = query(collection(db, 'neonatos'), where('estado', '==', estadoFilter));
          snapshot = await getDocs(q);
        }
      } else {
        // Sin filtro, solo ordenar
        const q = query(collection(db, 'neonatos'), orderBy('fecha', 'desc'));
        snapshot = await getDocs(q);
      }

      let neonatos = snapshot.docs.map(doc => ({
        id_neonato: doc.id,
        ...doc.data()
      } as Neonato));

      // Si no se pudo ordenar en Firebase, ordenar en el cliente
      if (estadoFilter !== undefined) {
        neonatos = neonatos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }

      return neonatos;
    } catch (error) {
      console.error('Error obteniendo neonatos:', error);
      // Fallback: obtener todos los neonatos y filtrar/ordenar en el cliente
      const q = query(collection(db, 'neonatos'));
      const snapshot = await getDocs(q);
      let neonatos = snapshot.docs.map(doc => ({
        id_neonato: doc.id,
        ...doc.data()
      } as Neonato));

      // Filtrar por estado si es necesario
      if (estadoFilter !== undefined) {
        neonatos = neonatos.filter(neonato => neonato.estado === estadoFilter);
      }

      // Ordenar por fecha
      neonatos = neonatos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      return neonatos;
    }
  }

  static async getNeonatosByMadre(idMadre: string): Promise<Neonato[]> {
    try {
      const q = query(
        collection(db, 'neonatos'),
        where('id_madre', '==', idMadre),
        orderBy('fecha', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id_neonato: doc.id,
        ...doc.data()
      } as Neonato));
    } catch (error) {
      console.error('Error en getNeonatosByMadre:', error);
      return [];
    }
  }

  static async updateNeonato(id: string, data: Partial<Neonato>): Promise<void> {
    const docRef = doc(db, 'neonatos', id);
    await updateDoc(docRef, data);
  }


  static async getEstadisticas(): Promise<Estadisticas> {
    const [madresSnapshot, neonatosSnapshot] = await Promise.all([
      getDocs(collection(db, 'madres')),
      getDocs(collection(db, 'neonatos'))
    ]);

    const madres = madresSnapshot.docs.map(doc => doc.data() as Madre);
    const neonatos = neonatosSnapshot.docs.map(doc => doc.data() as Neonato);

    return {
      madres: {
        total: madres.length,
        activas: madres.filter(m => m.estado).length,
        inactivas: madres.filter(m => !m.estado).length,
      },
      neonatos: {
        total: neonatos.length,
        activos: neonatos.filter(n => n.estado).length,
        inactivos: neonatos.filter(n => !n.estado).length,
      },
      llanto: {
        total: 0,
      },
    };
  }

  // Funciones de eliminación
  static async deleteMadre(id: string): Promise<void> {
    const docRef = doc(db, 'madres', id);
    await deleteDoc(docRef);
  }

  static async deleteNeonato(id: string): Promise<void> {
    const docRef = doc(db, 'neonatos', id);
    await deleteDoc(docRef);
  }

  static async deleteMadreConNeonatos(idMadre: string): Promise<void> {
    // Primero eliminar todos los neonatos relacionados
    const neonatos = await this.getNeonatosByMadre(idMadre);
    const deleteNeonatosPromises = neonatos.map(neonato => this.deleteNeonato(neonato.id_neonato));
    await Promise.all(deleteNeonatosPromises);
    
    // Luego eliminar la madre
    await this.deleteMadre(idMadre);
  }

  // Utilidades para manejo de archivos
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

  static isDataUrl(url: string): boolean {
    return url.startsWith('data:');
  }

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

  // Funciones de Firebase Storage para fotos
  static async uploadFotoOreja(file: File, neonatoId: string, tipo: 'derecha' | 'izquierda'): Promise<string> {
    try {
      // Comprimir imagen si es muy grande
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // Si es mayor a 1MB
        fileToUpload = await this.compressImage(file);
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.jpg`;
      const storagePath = `neonatos/${neonatoId}/orejas/${tipo}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      // Subir el archivo con uploadBytesResumable para mejor manejo
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
        contentType: 'image/jpeg'
      });
      
      // Esperar a que termine la subida
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Opcional: mostrar progreso
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Subiendo: ${progress.toFixed(0)}%`);
          },
          (error) => reject(error),
          () => resolve(uploadTask.snapshot.ref)
        );
      });
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      
      console.log('Imagen subida exitosamente:', {
        path: storagePath,
        url: downloadURL,
        size: fileToUpload.size,
        type: fileToUpload.type
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw new Error('Error al subir la imagen: ' + error);
    }
  }

  static async deleteFotoOreja(downloadURL: string): Promise<void> {
    try {
      // Convertir URL a referencia de storage
      const storageRef = ref(storage, downloadURL);
      await deleteObject(storageRef);
      console.log('Imagen eliminada exitosamente:', downloadURL);
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      throw new Error('Error al eliminar la imagen: ' + error);
    }
  }

  static async getFotosNeonato(neonatoId: string): Promise<{
    fotos_oreja_derecha: string[];
    fotos_oreja_izquierda: string[];
  }> {
    const fotos = {
      fotos_oreja_derecha: [] as string[],
      fotos_oreja_izquierda: [] as string[]
    };

    try {
      // Obtener fotos de oreja derecha
      const derechaRef = ref(storage, `neonatos/${neonatoId}/oreja_derecha`);
      const derechaList = await listAll(derechaRef);
      fotos.fotos_oreja_derecha = await Promise.all(
        derechaList.items.map(item => getDownloadURL(item))
      );

      // Obtener fotos de oreja izquierda
      const izquierdaRef = ref(storage, `neonatos/${neonatoId}/oreja_izquierda`);
      const izquierdaList = await listAll(izquierdaRef);
      fotos.fotos_oreja_izquierda = await Promise.all(
        izquierdaList.items.map(item => getDownloadURL(item))
      );
    } catch (error) {
      console.warn('Error obteniendo fotos del neonato:', error);
    }

    return fotos;
  }

  // Función para subir múltiples imágenes con manejo robusto
  static async uploadLoteFotos(fotos: string[], neonatoId: string, lado: 'derecha' | 'izquierda'): Promise<{
    exitosas: string[];
    fallidas: { foto: string; error: string }[];
  }> {
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
          // Ya es una URL de Firebase Storage, mantenerla
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
        fallidas.push({ foto: fotos[index], error: result.reason?.message || 'Error desconocido' });
      }
    });

    return { exitosas, fallidas };
  }

  // Función para subir múltiples imágenes (método anterior mantenido para compatibilidad)
  static async uploadMultipleFotos(files: File[], neonatoId: string, tipo: 'derecha' | 'izquierda'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFotoOreja(file, neonatoId, tipo));
    return await Promise.all(uploadPromises);
  }

  // Función para eliminar múltiples imágenes
  static async deleteMultipleFotos(urls: string[]): Promise<void> {
    const deletePromises = urls.map(url => this.deleteFotoOreja(url));
    await Promise.all(deletePromises);
  }

  static async findByQRData(madreDocumento: string, neonatoId: string): Promise<{ madre: Madre | null; neonato: Neonato | null }> {
    try {
      // Madre por número de documento (consulta directa)
      let madre: Madre | null = null;
      if (madreDocumento) {
        const qMadre = query(
          collection(db, 'madres'),
          where('numero_documento', '==', madreDocumento),
          limit(1)
        );
        const snapMadre = await getDocs(qMadre);
        if (!snapMadre.empty) {
          const d = snapMadre.docs[0];
          madre = { id_madre: d.id, ...(d.data() as any) } as Madre;
        }
      }

      // Neonato por ID de documento (lookup directo por doc.id)
      let neonato: Neonato | null = null;
      if (neonatoId) {
        const neonatoRef = doc(db, 'neonatos', neonatoId);
        const neonatoDoc = await getDoc(neonatoRef);
        if (neonatoDoc.exists()) {
          neonato = { id_neonato: neonatoDoc.id, ...(neonatoDoc.data() as any) } as Neonato;
        }
      }

      return { madre, neonato };
    } catch (error) {
      console.error('Error buscando datos por QR:', error);
      return { madre: null, neonato: null };
    }
  }

  // Nueva función para buscar por qr_id en ambas colecciones
  static async findByQRId(qrId: string, includeFotos: boolean = false): Promise<{ madre: Madre | null; neonato: Neonato | null; fotos?: { fotos_oreja_derecha: string[]; fotos_oreja_izquierda: string[] } }> {
    try {
      // 1) Consultas dirigidas por qr_id en cada colección
      let madre: Madre | null = null;
      let neonato: Neonato | null = null;

      const qMadre = query(
        collection(db, 'madres'),
        where('qr_id', '==', qrId),
        limit(1)
      );
      const qNeonato = query(
        collection(db, 'neonatos'),
        where('qr_id', '==', qrId),
        limit(1)
      );

      const [snapMadre, snapNeonato] = await Promise.all([
        getDocs(qMadre),
        getDocs(qNeonato)
      ]);

      if (!snapMadre.empty) {
        const d = snapMadre.docs[0];
        madre = { id_madre: d.id, ...(d.data() as any) } as Madre;
      }
      if (!snapNeonato.empty) {
        const d = snapNeonato.docs[0];
        neonato = { id_neonato: d.id, ...(d.data() as any) } as Neonato;
      }

      // 2) Enlazar por id_madre si solo uno coincide por qr_id
      if (!neonato && madre) {
        // Buscar el neonato activo (o el más reciente) de esa madre mediante consulta
        const qNeonatosMadre = query(
          collection(db, 'neonatos'),
          where('id_madre', '==', madre.id_madre),
          orderBy('fecha', 'desc'),
          limit(5)
        );
        const snap = await getDocs(qNeonatosMadre);
        const neonatosDeMadre = snap.docs.map(d => ({ id_neonato: d.id, ...(d.data() as any) } as Neonato));
        neonato = (neonatosDeMadre.find(n => n.estado) || neonatosDeMadre[0]) || null;
      }

      if (!madre && neonato) {
        // Traer la madre del neonato por doc.id
        const madreRef = doc(db, 'madres', neonato.id_madre);
        const madreDoc = await getDoc(madreRef);
        if (madreDoc.exists()) {
          madre = { id_madre: madreDoc.id, ...(madreDoc.data() as any) } as Madre;
        }
      }

      // 3) Obtener fotos del neonato si existe y se solicita
      let fotos = undefined as { fotos_oreja_derecha: string[]; fotos_oreja_izquierda: string[] } | undefined;
      if (includeFotos && neonato) {
        try {
          fotos = await this.getFotosNeonato(neonato.id_neonato);
        } catch (e) {
          console.warn('No se pudieron obtener fotos del neonato:', e);
        }
      }

      return { madre, neonato, fotos };
    } catch (error) {
      console.error('Error buscando datos por qr_id:', error);
      return { madre: null, neonato: null };
    }
  }
}
