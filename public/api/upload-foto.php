<?php
require_once 'config.php';

// Configurar headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Método no permitido', 405);
}

// Verificar que se recibieron los parámetros necesarios
if (!isset($_POST['id_neonato']) || !isset($_POST['tipo']) || !isset($_FILES['imagen'])) {
    sendErrorResponse('Parámetros faltantes: id_neonato, tipo, imagen');
}

$neonatoId = trim($_POST['id_neonato']);
$tipo = trim($_POST['tipo']);
$imagen = $_FILES['imagen'];

// Validar parámetros
if (empty($neonatoId)) {
    sendErrorResponse('ID del neonato es requerido');
}

if (!in_array($tipo, ['derecha', 'izquierda'])) {
    sendErrorResponse('Tipo debe ser "derecha" o "izquierda"');
}

// Validar archivo de imagen
$validationErrors = validateImageFile($imagen);
if (!empty($validationErrors)) {
    sendErrorResponse('Error de validación: ' . implode(', ', $validationErrors));
}

// Verificar límite de archivos por tipo
$currentCount = countFilesByType($neonatoId, $tipo);
if ($currentCount >= MAX_FILES_PER_EAR) {
    sendErrorResponse("Ya se han subido el máximo de " . MAX_FILES_PER_EAR . " fotos para la oreja {$tipo}");
}

try {
    // Crear directorio del neonato si no existe
    $neonatoPath = BASE_UPLOAD_PATH . "neonatos/{$neonatoId}/";
    if (!createDirectoryIfNotExists($neonatoPath)) {
        sendErrorResponse('Error creando directorio del neonato', 500);
    }
    
    // Generar nombre único para el archivo
    $filename = generateUniqueFileName($tipo, $neonatoId);
    $filePath = $neonatoPath . $filename;
    
    // Mover archivo subido al destino final
    if (!move_uploaded_file($imagen['tmp_name'], $filePath)) {
        sendErrorResponse('Error guardando el archivo', 500);
    }
    
    // Generar URL completa de la imagen
    $imageUrl = BASE_URL . 'uploads/neonatos/' . $neonatoId . '/' . $filename;
    
    // Respuesta exitosa
    sendJsonResponse([
        'success' => true,
        'message' => 'Imagen subida exitosamente',
        'url' => $imageUrl,
        'filename' => $filename,
        'neonato_id' => $neonatoId,
        'tipo' => $tipo,
        'count' => $currentCount + 1
    ]);
    
} catch (Exception $e) {
    sendErrorResponse('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>
