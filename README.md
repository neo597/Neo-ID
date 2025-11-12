# NEO-ID - Sistema de Gestión Neonatal

## 📋 ¿Qué es NEO-ID?

**NEO-ID** es una aplicación web diseñada para gestionar la identificación y registro de neonatos (bebés recién nacidos) y sus madres en un entorno hospitalario. El sistema utiliza códigos **DataMatrix** para garantizar la seguridad y trazabilidad de los pacientes, permitiendo la relación entre madres y neonatos mediante códigos únicos.

**Objetivo del Proyecto de Grado**: Implementar un sistema de identificación mediante DataMatrix que relacione neonatos con sus madres, facilitando la gestión y trazabilidad en el entorno hospitalario.

## 🎯 ¿Qué hace la aplicación?

La aplicación permite:

### 1. **Gestión de Madres** ⭐ Funcionalidad Principal
- Registrar información de madres (nombre, documento, servicio, habitación)
- Ver lista de todas las madres registradas
- Editar y actualizar datos de madres
- **Asociar códigos DataMatrix únicos a cada madre**
- Relacionar madres con sus neonatos

### 2. **Gestión de Neonatos** ⭐ Funcionalidad Principal
- Registrar información completa de neonatos (datos de nacimiento, medidas, servicio)
- **Vincular neonatos con sus madres mediante DataMatrix**
- **Asociar códigos DataMatrix únicos a cada neonato**
- Registrar observaciones y estado del neonato
- Almacenar información médica relevante

### 3. **Sistema de DataMatrix** ⭐ Funcionalidad Principal
- **Generar códigos DataMatrix en lotes para impresión**
- **Asociar códigos pre-impresos con registros de madres y neonatos**
- **Escaneo de códigos DataMatrix para identificar rápidamente madres y neonatos**
- Relación bidireccional entre madres y neonatos mediante códigos

### 4. **Escaneo de Códigos QR/DataMatrix**
- Escanear códigos con la cámara del dispositivo
- Identificar automáticamente a madres o neonatos al escanear
- Visualizar información completa del registro escaneado

### 5. **Administración y Estadísticas**
- Ver estadísticas generales (total de madres, neonatos activos/inactivos)
- Acceder a la base de datos completa
- Gestionar registros almacenados en Firebase

### 6. **Reconocimiento Biométrico de Orejas** 🔧 En Desarrollo
- **Nota**: Esta funcionalidad está en fase de desarrollo
- El frontend está implementado, pero el backend Python para categorizar y tokenizar las imágenes aún no está disponible
- Captura de fotos de las orejas del neonato (interfaz lista)
- Sistema de reconocimiento pendiente de implementación

## 🔗 Sistema de Vinculación con DataMatrix

El sistema utiliza **dos tipos de vinculación** para relacionar madres y neonatos mediante códigos DataMatrix:

### 1. **Vinculación Directa en Base de Datos**

Cada neonato está vinculado directamente con su madre mediante el campo `id_madre`:

```typescript
// Estructura de datos
Neonato {
  id_neonato: string;
  id_madre: string;        // ← Vinculación directa con la madre
  nombre_neonato: string;
  // ... otros campos
}
```

Esta relación permite:
- Ver todos los neonatos de una madre específica
- Navegar desde un neonato a su madre
- Mantener la integridad referencial de los datos

### 2. **Códigos DataMatrix del Sistema**

Cuando se genera un código DataMatrix desde la aplicación, este contiene información de **ambos** (madre y neonato) en un formato JSON:

```json
{
  "madreId": "M-20241013-001",
  "madreDocumento": "12345678",
  "neonatoId": "N-20241013-001",
  "neonatoNombre": "Juan Pérez",
  "timestamp": "2024-10-13T10:30:00.000Z"
}
```

**Ventajas de este sistema:**
- ✅ Un solo código identifica tanto a la madre como al neonato
- ✅ Al escanear el código, se obtiene información de ambos
- ✅ Relación bidireccional garantizada
- ✅ Trazabilidad completa del vínculo

### 3. **Códigos DataMatrix Pre-impresos de la Clínica**

El sistema también soporta códigos DataMatrix pre-impresos que la clínica puede asignar:

```typescript
// Madre con código pre-impreso
Madre {
  id_madre: string;
  qr_id: "NEO37001"  // ← Código DataMatrix de la clínica
  // ... otros campos
}

// Neonato con código pre-impreso
Neonato {
  id_neonato: string;
  qr_id: "NAB38001"  // ← Código DataMatrix de la clínica
  // ... otros campos
}
```

**Funcionamiento:**
- Los códigos pre-impresos se pueden escanear y asociar a registros existentes
- El sistema busca en ambas colecciones (madres y neonatos) cuando se escanea un código
- Permite flexibilidad para usar códigos externos o del sistema

### 4. **Proceso de Escaneo y Búsqueda**

Cuando se escanea un código DataMatrix, el sistema:

1. **Decodifica el código** para determinar su tipo:
   - Si es un código del sistema → Extrae `madreId` y `neonatoId`
   - Si es un código pre-impreso → Obtiene el `qr_id`

2. **Busca en la base de datos**:
   - Para códigos del sistema: Busca directamente por IDs
   - Para códigos pre-impresos: Busca en ambas colecciones por `qr_id`

3. **Muestra la información**:
   - Información completa de la madre (si existe)
   - Información completa del neonato (si existe)
   - Relación entre ambos

### 5. **Flujo de Trabajo Completo**

```
┌─────────────────┐
│ Registrar Madre │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Asignar qr_id (opcional)│ ← Código pre-impreso de la clínica
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│ Registrar Neonato    │
└────────┬─────────────┘
         │
         ├─→ Vincula con madre (id_madre)
         │
         ├─→ Asignar qr_id (opcional) ← Código pre-impreso
         │
         └─→ Generar código del sistema ← Contiene ambos IDs
```

**Ejemplo práctico:**

1. Se registra una madre con `id_madre: "M-20241013-001"`
2. Se registra un neonato con `id_neonato: "N-20241013-001"` y `id_madre: "M-20241013-001"`
3. El sistema genera un DataMatrix que contiene ambos IDs
4. Al escanear ese código, se muestra información de la madre Y del neonato
5. La relación está garantizada tanto en la base de datos como en el código

## ⚙️ Cómo Funciona la Aplicación

### Estructura General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    NEO-ID - Sistema Web                      │
│                  (Vue 3 + TypeScript + Vite)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │         Firebase (Backend)             │
        ├───────────────────────────────────────┤
        │  • Firestore (Base de Datos)        │
        │  • Storage (Almacenamiento de Fotos)  │
        └───────────────────────────────────────┘
```

### Flujo de Funcionamiento Principal

#### 1. Inicio de la Aplicación

```
Usuario abre la aplicación
         │
         ▼
┌────────────────────┐
│   Dashboard        │
│  (Página Principal)│
└─────────┬──────────┘
          │
          ├─→ Muestra estadísticas
          │   • Total de madres
          │   • Total de neonatos
          │   • Estados activos/inactivos
          │
          └─→ Accesos rápidos a:
              • Gestión de Madres
              • Gestión de Neonatos
              • Escáner QR
              • Generador DataMatrix
```

#### 2. Proceso de Registro de Madre

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRO DE MADRE                        │
└─────────────────────────────────────────────────────────────┘

Paso 1: Usuario accede a "Nueva Madre"
         │
         ▼
┌────────────────────┐
│  Formulario Madre  │
│  • Nombre           │
│  • Tipo Documento   │
│  • Número Documento │
│  • Servicio         │
│  • Habitación       │
│  • Observaciones    │
└─────────┬──────────┘
          │
          ├─→ Opcional: Escanear DataMatrix pre-impreso
          │   (qr_id de la clínica)
          │
          ▼
┌────────────────────┐
│  Firebase Service  │
│  • Genera ID único │
│    (M-YYYYMMDD-###)│
│  • Valida datos    │
│  • Guarda en DB    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Firebase Firestore│
│  Colección: madres │
│  • id_madre        │
│  • qr_id (opcional)│
│  • Datos personales│
└────────────────────┘
```

#### 3. Proceso de Registro de Neonato

```
┌─────────────────────────────────────────────────────────────┐
│                  REGISTRO DE NEONATO                        │
└─────────────────────────────────────────────────────────────┘

Paso 1: Usuario accede a "Nuevo Neonato"
         │
         ▼
┌────────────────────┐
│  Formulario Paso 1 │
│  • Seleccionar     │
│    Madre           │
│  • Escanear        │
│    DataMatrix      │
│    (opcional)      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Formulario Paso 2 │
│  • Datos básicos   │
│  • Fecha/hora      │
│    nacimiento      │
│  • Sexo            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Formulario Paso 3 │
│  • Medidas         │
│    (talla, peso,   │
│     PC, PA, PT)    │
│  • Servicio        │
│  • Observaciones   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Firebase Service  │
│  • Genera ID único │
│    (N-YYYYMMDD-###)│
│  • Vincula con     │
│    madre (id_madre)│
│  • Guarda en DB    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Generar DataMatrix│
│  • Crea código con │
│    info de madre   │
│    y neonato       │
│  • Almacena URL    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Firebase Firestore│
│  Colección: neonatos│
│  • id_neonato      │
│  • id_madre        │ ← Vinculación
│  • qr_id (opcional)│
│  • qr_code (URL)  │
│  • Datos médicos   │
└────────────────────┘
```

#### 4. Proceso de Escaneo de Códigos

```
┌─────────────────────────────────────────────────────────────┐
│              ESCANEO DE CÓDIGOS DATAMATRIX                   │
└─────────────────────────────────────────────────────────────┘

Usuario escanea código con cámara
         │
         ▼
┌────────────────────┐
│  QRScanner         │
│  Component         │
│  • Captura código  │
│  • Decodifica      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  QRService         │
│  • Analiza código  │
│  • Determina tipo │
└─────────┬──────────┘
          │
          ├─→ ¿Es código del sistema?
          │   │
          │   ├─→ SÍ: Extrae JSON
          │   │   {
          │   │     madreId: "...",
          │   │     neonatoId: "..."
          │   │   }
          │   │
          │   └─→ NO: Es qr_id (texto simple)
          │
          ▼
┌────────────────────┐
│  Firebase Service  │
│  findByQRData() o  │
│  findByQRId()      │
└─────────┬──────────┘
          │
          ├─→ Busca en colección "madres"
          │   • Por documento (código sistema)
          │   • Por qr_id (código pre-impreso)
          │
          └─→ Busca en colección "neonatos"
              • Por id_neonato (código sistema)
              • Por qr_id (código pre-impreso)
          │
          ▼
┌────────────────────┐
│  Resultado         │
│  • Info de Madre   │
│  • Info de Neonato │
│  • Relación        │
│  • Acciones        │
└────────────────────┘
```

#### 5. Generación de Códigos DataMatrix

```
┌─────────────────────────────────────────────────────────────┐
│          GENERACIÓN DE CÓDIGOS DATAMATRIX                   │
└─────────────────────────────────────────────────────────────┘

Usuario accede a Generador DataMatrix
         │
         ▼
┌────────────────────┐
│  Seleccionar       │
│  Prefijo           │
│  • NEO37           │
│  • NAB38           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Generar Códigos   │
│  • Individual      │
│  • Lote (10, 50,   │
│    100)            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  DataMatrix Utils  │
│  • Genera código   │
│    único           │
│  • Evita duplicados│
│  • Crea imagen     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Visualización     │
│  • Grid de códigos │
│  • Imprimir        │
│  • Exportar        │
└────────────────────┘
```

### Estructura de Datos en Firebase

Firebase Firestore organiza los datos en **colecciones** y **documentos**. A continuación se muestra la estructura completa basada en la evidencia del sistema:

#### Estructura General de Exportación

Cuando se exportan los datos de Firebase, se genera un objeto JSON con la siguiente estructura:

```json
{
  "estadisticas": { ... },
  "madres": [ ... ],
  "neonatos": [ ... ],
  "relaciones": [ ... ],
  "fechaExportacion": "2025-11-11T22:27:48.791Z"
}
```

#### 1. Colección: `madres`

Cada documento en la colección `madres` tiene la siguiente estructura:

```json
{
  "id_madre": "M-20251015-003",
  "nombre_madre": "Silvia Acuña",
  "tipo_documento": "PPT",
  "numero_documento": "13568999",
  "servicio": "cirugia",
  "habitacion": "201",  // Opcional
  "observaciones": "Ninguna",
  "estado": true,
  "fecha": "2025-10-15T15:55:19.248Z",
  "qr_id": "1A2B"  // Opcional: código DataMatrix pre-impreso
}
```

**Campos:**
- `id_madre` (string, requerido): ID único generado automáticamente con formato `M-YYYYMMDD-###`
- `nombre_madre` (string, requerido): Nombre completo de la madre
- `tipo_documento` (string, requerido): Tipo de documento (CC, PPT, TI, etc.)
- `numero_documento` (string, requerido): Número de documento de identidad
- `servicio` (string, requerido): Servicio médico donde se encuentra
- `habitacion` (string, opcional): Número de habitación
- `observaciones` (string, opcional): Notas adicionales
- `estado` (boolean, requerido): Estado activo (true) o inactivo (false)
- `fecha` (timestamp, requerido): Fecha y hora de registro
- `qr_id` (string, opcional): Código DataMatrix pre-impreso de la clínica

#### 2. Colección: `neonatos`

Cada documento en la colección `neonatos` tiene la siguiente estructura:

```json
{
  "id_neonato": "D5RfI53JvzwSnYeuSTyL",
  "id_madre": "q7bqAWK0DM9T37qADUfp",  // ← Vinculación con madre
  "nombre_neonato": "Adrian Baeza",
  "fecha_nacimiento": "2025-10-08",
  "hora_nacimiento": "21:52",
  "sexo": "M",  // M: Masculino, F: Femenino
  "talla": 432,  // En centímetros
  "peso": 435,   // En gramos
  "pc": 234,     // Perímetro cefálico en cm
  "pa": 234234,  // Perímetro abdominal en cm
  "pt": 324,     // Perímetro torácico en cm
  "permeabilidad_rectal": "Si",  // Si/No
  "servicio": "324",
  "se_encuentra_en": "234",
  "observaciones": "23423",
  "estado": true,
  "fecha": "2025-10-09T02:52:53.677Z",
  "qr_id": "1A2B",  // Opcional: código DataMatrix pre-impreso
  "qr_code": "https://...",  // Opcional: URL del DataMatrix generado
  "fotos_oreja_derecha": [  // Opcional: Array de URLs
    "https://neoidapp.infinityfreeapp.com/uploads/neonatos/.../oreja_derecha_1760475315_4192440d.jpg"
  ],
  "fotos_oreja_izquierda": [  // Opcional: Array de URLs
    "https://..."
  ]
}
```

**Campos:**
- `id_neonato` (string, requerido): ID único del neonato (puede ser auto-generado o formato `N-YYYYMMDD-###`)
- `id_madre` (string, requerido): **Vinculación** con la madre mediante su `id_madre`
- `nombre_neonato` (string, requerido): Nombre del neonato
- `fecha_nacimiento` (string, requerido): Fecha en formato `YYYY-MM-DD`
- `hora_nacimiento` (string, requerido): Hora en formato `HH:MM`
- `sexo` (string, requerido): "M" (Masculino) o "F" (Femenino)
- `talla` (number, requerido): Talla en centímetros
- `peso` (number, requerido): Peso en gramos
- `pc` (number, requerido): Perímetro cefálico en centímetros
- `pa` (number, requerido): Perímetro abdominal en centímetros
- `pt` (number, requerido): Perímetro torácico en centímetros
- `permeabilidad_rectal` (string, requerido): "Si" o "No"
- `servicio` (string, requerido): Servicio médico
- `se_encuentra_en` (string, requerido): Ubicación actual (cuna, habitación, etc.)
- `observaciones` (string, opcional): Notas médicas adicionales
- `estado` (boolean, requerido): Estado activo (true) o inactivo (false)
- `fecha` (timestamp, requerido): Fecha y hora de registro
- `qr_id` (string, opcional): Código DataMatrix pre-impreso de la clínica
- `qr_code` (string, opcional): URL del DataMatrix generado por el sistema
- `fotos_oreja_derecha` (array<string>, opcional): Array de URLs de fotos de la oreja derecha
- `fotos_oreja_izquierda` (array<string>, opcional): Array de URLs de fotos de la oreja izquierda

#### 3. Estructura de Estadísticas

Las estadísticas se calculan dinámicamente y tienen esta estructura:

```json
{
  "estadisticas": {
    "madres": {
      "total": 4,
      "activas": 4,
      "inactivas": 0
    },
    "neonatos": {
      "total": 4,
      "activos": 4,
      "inactivos": 0
    },
    "llanto": {
      "total": 0
    }
  }
}
```

#### 4. Estructura de Relaciones (Exportación)

Cuando se exportan los datos, se genera un array de relaciones que agrupa cada madre con sus neonatos:

```json
{
  "relaciones": [
    {
      "madre": {
        "id_madre": "M-20251015-003",
        "nombre_madre": "Silvia Acuña",
        "tipo_documento": "PPT",
        "numero_documento": "13568999",
        "servicio": "cirugia",
        "observaciones": "Ninguna",
        "estado": true,
        "fecha": "2025-10-15T15:55:19.248Z",
        "qr_id": "1A2B"
      },
      "neonatos": [
        {
          "id_neonato": "MiU5hdc2APPv68PxFXBR",
          "id_madre": "M-20251015-003",
          "nombre_neonato": "Oslo acuña",
          "fecha_nacimiento": "2025-10-15",
          "hora_nacimiento": "10:55",
          "sexo": "M",
          "talla": 46,
          "peso": 4677,
          "pc": 24,
          "pa": 57,
          "pt": 77,
          "permeabilidad_rectal": "Si",
          "servicio": "Habitación",
          "se_encuentra_en": "Habitación",
          "observaciones": "Ninguna",
          "estado": true,
          "fecha": "2025-10-15T15:56:24.525Z",
          "qr_id": "1A2B"
        }
      ]
    }
  ]
}
```

**Nota**: Esta estructura de relaciones se genera al exportar datos. En Firebase, las relaciones se mantienen mediante el campo `id_madre` en cada neonato.

#### 5. Ejemplo Completo de Estructura Firebase

```json
{
  "estadisticas": {
    "madres": {
      "total": 4,
      "activas": 4,
      "inactivas": 0
    },
    "neonatos": {
      "total": 4,
      "activos": 4,
      "inactivos": 0
    },
    "llanto": {
      "total": 0
    }
  },
  "madres": [
    {
      "id_madre": "M-20251015-003",
      "nombre_madre": "Silvia Acuña",
      "tipo_documento": "PPT",
      "numero_documento": "13568999",
      "servicio": "cirugia",
      "observaciones": "Ninguna",
      "estado": true,
      "fecha": "2025-10-15T15:55:19.248Z",
      "qr_id": "1A2B"
    }
  ],
  "neonatos": [
    {
      "id_neonato": "MiU5hdc2APPv68PxFXBR",
      "id_madre": "M-20251015-003",
      "nombre_neonato": "Oslo acuña",
      "fecha_nacimiento": "2025-10-15",
      "hora_nacimiento": "10:55",
      "sexo": "M",
      "talla": 46,
      "peso": 4677,
      "pc": 24,
      "pa": 57,
      "pt": 77,
      "permeabilidad_rectal": "Si",
      "servicio": "Habitación",
      "se_encuentra_en": "Habitación",
      "observaciones": "Ninguna",
      "estado": true,
      "fecha": "2025-10-15T15:56:24.525Z",
      "qr_id": "1A2B",
      "fotos_oreja_derecha": [
        "https://neoidapp.infinityfreeapp.com/uploads/neonatos/.../oreja_derecha_xxx.jpg"
      ]
    }
  ],
  "relaciones": [
    {
      "madre": { ... },
      "neonatos": [ ... ]
    }
  ],
  "fechaExportacion": "2025-11-11T22:27:48.791Z"
}
```

#### 6. Relaciones entre Colecciones

```
┌─────────────────────┐
│   Colección: madres  │
│                     │
│  id_madre (PK)      │
│  nombre_madre       │
│  numero_documento   │
│  qr_id              │
│  ...                │
└──────────┬──────────┘
           │
           │ 1:N (Una madre puede tener varios neonatos)
           │
           ▼
┌─────────────────────┐
│ Colección: neonatos │
│                     │
│  id_neonato (PK)    │
│  id_madre (FK) ─────┘ ← Referencia a madres
│  nombre_neonato     │
│  qr_id              │
│  fotos_oreja_*      │
│  ...                │
└─────────────────────┘
```

**Clave de la relación:**
- Cada neonato tiene un campo `id_madre` que referencia al `id_madre` de su madre
- Esta es una relación **uno a muchos** (1:N): una madre puede tener múltiples neonatos
- La búsqueda de neonatos por madre se realiza filtrando por `id_madre`

### Flujo de Datos Completo

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       │ Interacción
       │
       ▼
┌─────────────────────────────────┐
│   Componentes Vue (Frontend)   │
│  • Views (páginas)              │
│  • Components (reutilizables)   │
└──────┬──────────────────────────┘
       │
       │ Llamadas a servicios
       │
       ▼
┌─────────────────────────────────┐
│   Services (Lógica de Negocio)  │
│  • FirebaseService              │
│  • QRService                    │
│  • PhotoService                 │
└──────┬──────────────────────────┘
       │
       │ API Calls
       │
       ▼
┌─────────────────────────────────┐
│      Firebase (Backend)         │
│  • Firestore (Base de datos)    │
│  • Storage (Archivos)           │
└─────────────────────────────────┘
```

### Casos de Uso Principales

#### Caso 1: Registrar Madre y Neonato Nuevos

```
1. Usuario → "Nueva Madre"
2. Completa formulario
3. Sistema genera ID: M-20241013-001
4. Guarda en Firebase
5. Usuario → "Nuevo Neonato"
6. Selecciona madre (M-20241013-001)
7. Completa datos del neonato
8. Sistema genera ID: N-20241013-001
9. Vincula con madre (id_madre)
10. Genera DataMatrix con ambos IDs
11. Guarda en Firebase
```

#### Caso 2: Escanear Código para Identificar

```
1. Usuario → "Escáner QR"
2. Activa cámara
3. Escanea código DataMatrix
4. Sistema decodifica:
   {
     madreId: "M-20241013-001",
     neonatoId: "N-20241013-001"
   }
5. Busca en Firebase:
   - Madre por id_madre
   - Neonato por id_neonato
6. Muestra información completa
7. Usuario puede editar o ver detalles
```

#### Caso 3: Usar Código Pre-impreso de la Clínica

```
1. Clínica tiene códigos pre-impresos: NEO37001, NEO37002...
2. Usuario registra madre
3. Escanea código NEO37001
4. Sistema asigna qr_id: "NEO37001"
5. Usuario registra neonato
6. Escanea código NAB38001
7. Sistema asigna qr_id: "NAB38001"
8. Al escanear cualquiera de estos códigos:
   - Sistema busca por qr_id en ambas colecciones
   - Encuentra el registro correspondiente
   - Muestra información
```

### Diagrama de Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                        NEO-ID APP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │ MadresList   │  │NeonatosList  │     │
│  │  (Vista)     │  │  (Vista)     │  │  (Vista)      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────┐           │
│  │         Componentes Compartidos              │           │
│  │  • QRScanner                                  │           │
│  │  • QRDisplay                                  │           │
│  │  • MadreSelector                              │           │
│  │  • PageHeader                                 │           │
│  │  • MobileNav                                  │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                         │
│                     ▼                                         │
│  ┌──────────────────────────────────────────────┐           │
│  │              Services Layer                  │           │
│  │  • FirebaseService (CRUD operations)        │           │
│  │  • QRService (generación/decodificación)    │           │
│  │  • PhotoService (upload/download)           │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                         │
│                     ▼                                         │
│  ┌──────────────────────────────────────────────┐           │
│  │            Firebase (Backend)                │           │
│  │  • Firestore Database                        │           │
│  │  • Storage (Files)                           │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Estados y Transiciones

```
┌─────────────┐
│   Inicial   │
│  (Dashboard)│
└──────┬──────┘
       │
       ├─→ Registrar Madre ──→ ┌──────────────┐
       │                        │ Madre Creada │
       │                        └──────┬───────┘
       │                               │
       ├─→ Registrar Neonato ──→ ┌──────────────┐
       │                         │Neonato Creado│
       │                         └──────┬───────┘
       │                               │
       │                               ├─→ Genera DataMatrix
       │                               │
       ├─→ Escanear QR ──→ ┌──────────────┐
       │                   │QR Escaneado    │
       │                   └──────┬───────┘
       │                          │
       │                          ├─→ Busca en DB
       │                          │
       │                          └─→ Muestra Resultado
       │
       └─→ Generar DataMatrix ──→ ┌──────────────┐
                                   │Códigos Listos│
                                   └──────────────┘
```

## 🏗️ Arquitectura de la Aplicación

### Frontend (Esta aplicación)
- **Framework**: Vue 3 con TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Routing**: Vue Router
- **Backend**: Firebase (Firestore + Storage)

### Backend de Reconocimiento (En Desarrollo)
- **API Python**: Servidor separado para procesar imágenes de orejas (pendiente de implementación)
- **Estado Actual**: Solo el frontend está desarrollado, el backend para categorización y tokenización de imágenes no está disponible aún

## 🛠️ Tecnologías Utilizadas

### Dependencias Principales
- **Vue 3**: Framework JavaScript para construir interfaces de usuario
- **TypeScript**: Lenguaje que añade tipos a JavaScript
- **Vite**: Herramienta de construcción y desarrollo (explicado más abajo)
- **Firebase**: Base de datos y almacenamiento en la nube
- **Vue Router**: Sistema de navegación entre páginas
- **Axios**: Cliente HTTP para hacer peticiones a APIs
- **html5-qrcode**: Biblioteca para escanear códigos QR
- **qrcode**: Biblioteca para generar códigos QR

### Herramientas de Desarrollo
- **Tailwind CSS**: Framework de CSS para diseño rápido
- **PostCSS**: Procesador de CSS
- **vue-tsc**: Compilador TypeScript para Vue

## 📁 Estructura del Proyecto

```
NeoID/
├── src/
│   ├── components/          # Componentes reutilizables de Vue
│   │   ├── QRScanner.vue
│   │   ├── EarRecognitionModal.vue
│   │   ├── FotoGallery.vue
│   │   └── ...
│   ├── views/              # Páginas principales de la aplicación
│   │   ├── Dashboard.vue
│   │   ├── MadresList.vue
│   │   ├── NeonatosList.vue
│   │   ├── QRScannerView.vue
│   │   └── ...
│   ├── services/           # Lógica de negocio y comunicación con APIs
│   │   ├── firebase.service.ts
│   │   ├── ear-recognition.service.ts
│   │   ├── qr.service.ts
│   │   └── ...
│   ├── router/             # Configuración de rutas
│   │   └── index.ts
│   ├── types/              # Definiciones de tipos TypeScript
│   │   ├── models.ts
│   │   └── ...
│   ├── config/             # Configuraciones
│   │   ├── firebase.ts
│   │   └── ...
│   ├── App.vue             # Componente raíz
│   └── main.ts             # Punto de entrada de la aplicación
├── public/                 # Archivos estáticos
├── dist/                   # Archivos compilados para producción
├── package.json            # Dependencias y scripts
├── vite.config.ts          # Configuración de Vite
└── tailwind.config.js      # Configuración de Tailwind
```

## 🚀 ¿Qué es Vite y cómo funciona?

### ¿Qué es Vite?

**Vite** (pronunciado "veet", del francés "rápido") es una herramienta de construcción moderna para aplicaciones web. Es el reemplazo moderno de herramientas más antiguas como Webpack o Parcel.

### ¿Por qué usar Vite?

1. **Desarrollo Ultra Rápido**: 
   - No necesita "empaquetar" todo el código antes de ejecutarlo
   - Solo procesa los archivos que realmente necesitas en ese momento
   - Los cambios se reflejan instantáneamente en el navegador

2. **Hot Module Replacement (HMR)**:
   - Cuando cambias un archivo, solo ese módulo se actualiza
   - No necesitas recargar toda la página
   - Mantiene el estado de tu aplicación

3. **Optimizado para Producción**:
   - Usa Rollup (otra herramienta) para crear archivos optimizados
   - Divide el código en "chunks" (fragmentos) para cargar solo lo necesario
   - Minifica y comprime automáticamente

### ¿Cómo funciona Vite?

#### En Desarrollo (`npm run dev`)

1. **Servidor de Desarrollo**:
   ```
   Vite inicia un servidor local (normalmente en http://localhost:5173)
   ```

2. **Procesamiento bajo demanda**:
   - Cuando el navegador solicita un archivo `.vue` o `.ts`, Vite lo procesa al vuelo
   - No necesita compilar todo el proyecto primero
   - Antes: Compilar todo → Esperar → Ver cambios (lento)
   - Con Vite: Solicitar archivo → Procesar solo ese → Ver cambios (rápido)

3. **ES Modules nativos**:
   - Vite aprovecha que los navegadores modernos entienden `import/export` directamente
   - Solo convierte lo que el navegador no entiende (TypeScript, Vue, etc.)

#### En Producción (`npm run build`)

1. **Compilación completa**:
   ```
   Vite usa Rollup para:
   - Compilar TypeScript a JavaScript
   - Procesar archivos Vue
   - Combinar y optimizar código
   - Minificar archivos
   - Generar archivos en la carpeta /dist
   ```

2. **Optimizaciones**:
   - Divide el código en chunks para cargar solo lo necesario
   - Tree-shaking (elimina código no usado)
   - Compresión de archivos

### Scripts de Vite en este proyecto

En el `package.json` encontrarás estos comandos:

```json
{
  "scripts": {
    "dev": "vite",              // Inicia servidor de desarrollo
    "build": "vue-tsc -b && vite build",  // Compila para producción
    "preview": "vite preview"   // Previsualiza la versión de producción
  }
}
```

**Explicación de cada comando:**

- `npm run dev`: 
  - Inicia el servidor de desarrollo
  - Abre la app en `http://localhost:5173`
  - Los cambios se reflejan automáticamente

- `npm run build`:
  - Primero verifica tipos con `vue-tsc -b`
  - Luego compila todo con `vite build`
  - Genera archivos optimizados en `/dist`

- `npm run preview`:
  - Sirve la versión compilada localmente
  - Útil para probar cómo se verá en producción

## 🚀 Cómo Empezar

### Prerrequisitos

- **Node.js** (versión 16 o superior)
- **npm** (viene con Node.js)

### Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**:
   ```bash
   npm install
   ```
   Esto lee el `package.json` y descarga todas las librerías necesarias en la carpeta `node_modules/`.

3. **Configurar Firebase** (si es necesario):
   - El archivo `src/config/firebase.ts` debe tener las credenciales de Firebase
   - Si no las tienes, necesitarás crear un proyecto en Firebase Console

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación se abrirá en `http://localhost:5173`

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con Vite

# Producción
npm run build        # Compila la aplicación para producción
npm run preview      # Previsualiza la versión compilada
```

## 📱 Funcionalidades Principales

### 1. Dashboard
- Vista principal con estadísticas
- Accesos rápidos a las funciones principales
- Contador de madres y neonatos activos/inactivos

### 2. Gestión de Madres
- **Ruta**: `/madres`
- Lista todas las madres registradas
- Formulario para crear/editar madres
- Búsqueda y filtrado

### 3. Gestión de Neonatos ⭐
- **Ruta**: `/neonatos`
- Lista todos los neonatos
- Formulario completo con datos de nacimiento
- Asociación de códigos DataMatrix
- Vinculación con madres

### 4. Escáner QR/DataMatrix ⭐
- **Ruta**: `/qr-scanner`
- Escanea códigos DataMatrix con la cámara
- Identifica automáticamente madres o neonatos
- Muestra información completa del registro

### 5. Generador de DataMatrix ⭐
- **Ruta**: `/herramientas/datamatrix`
- Genera lotes de códigos DataMatrix
- Útil para imprimir códigos pre-impresos
- Asociación de códigos con registros

### 6. Reconocimiento de Orejas 🔧 (En Desarrollo)
- **Ruta**: `/ear-recognition`
- **Estado**: Frontend implementado, backend pendiente
- Interfaz lista para captura de fotos
- Sistema de reconocimiento no disponible aún

## 🔧 Configuración

### Firebase

La aplicación usa Firebase para:
- **Firestore**: Base de datos NoSQL para almacenar madres, neonatos, etc.
- **Storage**: Almacenamiento de imágenes (fotos de orejas)

Configuración en `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  // ... tus credenciales
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### API de Reconocimiento de Orejas (En Desarrollo)

**Estado Actual**: 
- ✅ Frontend implementado (interfaz de captura y visualización)
- ❌ Backend Python no disponible (sistema de categorización y tokenización de imágenes pendiente)

La aplicación está preparada para comunicarse con un servidor Python para el reconocimiento, pero este backend aún no está implementado. La configuración se encuentra en `src/config/python-api.ts`.

## 📚 Conceptos Importantes para Estudiantes

### Vue 3 - Componentes

Vue usa componentes. Cada archivo `.vue` es un componente:

```vue
<template>
  <!-- HTML aquí -->
</template>

<script setup lang="ts">
  // Lógica JavaScript/TypeScript aquí
</script>

<style>
  /* CSS aquí */
</style>
```

### TypeScript

TypeScript añade tipos a JavaScript:

```typescript
// En lugar de:
let nombre = "Juan";

// TypeScript permite:
let nombre: string = "Juan";
let edad: number = 25;
```

### Vue Router

Maneja la navegación entre páginas:

```typescript
// En router/index.ts
{
  path: '/madres',
  component: () => import('../views/MadresList.vue')
}
```

### Servicios

Los servicios contienen la lógica de negocio:

```typescript
// Ejemplo: firebase.service.ts
export class FirebaseService {
  static async getMadres() {
    // Lógica para obtener madres de Firebase
  }
}
```

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Elimina node_modules y reinstala
rm -rf node_modules
npm install
```

### Error de Firebase
- Verifica que las credenciales en `src/config/firebase.ts` sean correctas
- Asegúrate de que las reglas de Firestore permitan lectura/escritura

### Puerto ya en uso
```bash
# Vite usa el puerto 5173 por defecto
# Si está ocupado, Vite te sugerirá otro puerto automáticamente
```

## 📝 Notas para Desarrolladores

- La aplicación está diseñada para ser responsive (funciona en móviles y tablets)
- Usa Tailwind CSS para estilos (clases utilitarias)
- Los datos se almacenan en Firebase (requiere conexión a internet)
- **Funcionalidad Principal**: Sistema de DataMatrix para relacionar madres y neonatos
- **En Desarrollo**: El reconocimiento biométrico de orejas tiene el frontend listo, pero el backend Python está pendiente de implementación

## 🎓 Objetivos del Proyecto de Grado

Este proyecto tiene como objetivo principal:

1. **Implementar un sistema de identificación mediante DataMatrix** que relacione neonatos con sus madres
2. **Gestionar el registro completo** de madres y neonatos en un entorno hospitalario
3. **Facilitar la trazabilidad** mediante códigos únicos asociados a cada registro
4. **Proporcionar una interfaz web moderna** para la gestión y consulta de información

**Funcionalidades Adicionales (En Desarrollo)**:
- Reconocimiento biométrico de orejas (frontend implementado, backend pendiente)

## 📄 Licencia

Este proyecto es privado y está destinado para uso hospitalario como proyecto de grado.

---
