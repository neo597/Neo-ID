<?php
require_once 'config.php';

// Configurar headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Método no permitido', 405);
}

// Verificar que se recibió el parámetro necesario
if (!isset($_GET['id_neonato'])) {
    sendErrorResponse('Parámetro id_neonato es requerido');
}

$neonatoId = trim($_GET['id_neonato']);

// Validar parámetro
if (empty($neonatoId)) {
    sendErrorResponse('ID del neonato es requerido');
}

try {
    // Obtener todas las fotos del neonato
    $photos = getNeonatoPhotos($neonatoId);
    
    // Respuesta exitosa
    sendJsonResponse([
        'success' => true,
        'neonato_id' => $neonatoId,
        'photos' => $photos,
        'count_derecha' => count($photos['fotos_oreja_derecha']),
        'count_izquierda' => count($photos['fotos_oreja_izquierda']),
        'total' => count($photos['fotos_oreja_derecha']) + count($photos['fotos_oreja_izquierda'])
    ]);
    
} catch (Exception $e) {
    sendErrorResponse('Error interno del servidor: ' . $e->getMessage(), 500);
}
?>
