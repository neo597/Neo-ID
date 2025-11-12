# API de Imágenes para NeoID

Este directorio contiene los endpoints PHP para el manejo de imágenes de orejas de neonatos.

## Archivos

- `config.php` - Configuración y funciones helper
- `upload-foto.php` - Endpoint para subir imágenes
- `get-fotos.php` - Endpoint para obtener imágenes
- `delete-foto.php` - Endpoint para eliminar imágenes

## Instalación en el Servidor

### 1. Copiar archivos al servidor

Copiar toda la carpeta `public/api/` al servidor en:
```
http://www.neoidapp.infinityfreeapp.com/api/
```

### 2. Crear directorio de uploads

Crear el directorio de uploads en el servidor:
```
http://www.neoidapp.infinityfreeapp.com/uploads/
```

### 3. Configurar permisos

Asegurar que el directorio `uploads/` tenga permisos de escritura:
```bash
chmod 755 uploads/
```

### 4. Verificar configuración

Actualizar la URL base en `config.php` si es necesario:
```php
define('BASE_URL', 'http://www.neoidapp.infinityfreeapp.com/');
```

## Endpoints

### POST /api/upload-foto.php
Sube una imagen de oreja para un neonato.

**Parámetros:**
- `id_neonato` (string): ID del neonato
- `tipo` (string): "derecha" o "izquierda"
- `imagen` (file): Archivo de imagen

**Respuesta:**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "url": "http://www.neoidapp.infinityfreeapp.com/uploads/neonatos/123/oreja_derecha_1234567890_abc123.jpg",
  "filename": "oreja_derecha_1234567890_abc123.jpg",
  "neonato_id": "123",
  "tipo": "derecha",
  "count": 1
}
```

### GET /api/get-fotos.php
Obtiene todas las fotos de un neonato.

**Parámetros:**
- `id_neonato` (string): ID del neonato

**Respuesta:**
```json
{
  "success": true,
  "neonato_id": "123",
  "photos": {
    "fotos_oreja_derecha": [
      "http://www.neoidapp.infinityfreeapp.com/uploads/neonatos/123/oreja_derecha_1234567890_abc123.jpg"
    ],
    "fotos_oreja_izquierda": []
  },
  "count_derecha": 1,
  "count_izquierda": 0,
  "total": 1
}
```

### DELETE /api/delete-foto.php
Elimina una foto específica.

**Parámetros (JSON en body):**
- `id_neonato` (string): ID del neonato
- `filename` (string): Nombre del archivo a eliminar

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente",
  "neonato_id": "123",
  "filename": "oreja_derecha_1234567890_abc123.jpg"
}
```

## Estructura de Archivos

```
uploads/
└── neonatos/
    └── {id_neonato}/
        ├── oreja_derecha_1234567890_abc123.jpg
        ├── oreja_derecha_1234567891_def456.jpg
        ├── oreja_izquierda_1234567892_ghi789.jpg
        └── ...
```

## Límites y Validaciones

- Máximo 5 fotos por oreja (derecha/izquierda)
- Tamaño máximo: 5MB por imagen
- Formatos permitidos: JPG, PNG, GIF, WEBP
- Nombres de archivo: `oreja_{tipo}_{timestamp}_{random}.jpg`

## Seguridad

- Los endpoints son públicos (sin autenticación)
- Validación de tipos MIME
- Sanitización de nombres de archivo
- Protección contra listado de directorios (.htaccess)
- Prevención de ejecución de scripts PHP en uploads/

## CORS

Los endpoints están configurados para permitir peticiones desde cualquier origen:
```php
header('Access-Control-Allow-Origin: *');
```

## Monitoreo

Para verificar que los endpoints funcionan correctamente:

1. **Probar upload:**
```bash
curl -X POST -F "id_neonato=test123" -F "tipo=derecha" -F "imagen=@test.jpg" http://www.neoidapp.infinityfreeapp.com/api/upload-foto.php
```

2. **Probar get:**
```bash
curl "http://www.neoidapp.infinityfreeapp.com/api/get-fotos.php?id_neonato=test123"
```

3. **Probar delete:**
```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"id_neonato":"test123","filename":"oreja_derecha_1234567890_abc123.jpg"}' http://www.neoidapp.infinityfreeapp.com/api/delete-foto.php
```
