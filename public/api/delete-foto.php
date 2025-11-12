<?php
require_once 'config.php';

// Configurar headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Permitir DELETE y POST
if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    sendErrorResponse('Método no permitido', 405);
}

// Obtener parámetros según el método
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Para DELETE, leer del body JSON
    $input = json_decode(file_get_contents('php://input'), true);
    $neonatoId = $input['id_neonato'] ?? null;
    $filename = $input['filename'] ?? null;
} else {
    // Para POST, leer de $_POST
    $neonatoId = $_POST['id_neonato'] ?? null;
    $filename = $_POST['filename'] ?? null;
}

// Verificar parámetros necesarios
if (empty($neonatoId) || empty($filename)) {
    sendErrorResponse('Parámetros faltantes: id_neonato, filename');
}

// Sanitizar nombre de archivo para seguridad
$filename = sanitizeFileName($filename);

// Validar que el archivo tiene el formato esperado
if (!preg_match('/^oreja_(derecha|izquierda)_\d+_\w+\.jpg$/', $filename)) {
    sendErrorResponse('Nombre de archivo no válido');
}

try {
    // Intentar eliminar el archivo
    $deleted = deletePhotoFile($neonatoId, $filename);
    
    if ($deleted) {
        // Respuesta exitosa
        sendJsonResponse([
            'success' => true,
            'message' => 'Archivo eliminado exitosamente',
            'neonato_id' => $neonatoId,
            'filename' => $filename
        ]);
    } else {
        sendErrorResponse('No se pudo eliminar el archivo. Puede que no exista.', 404);
    }
    
} catch (Exception $e) {
    sendErrorResponse('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>
