<?php
// Configuración para el manejo de imágenes de orejas de neonatos

// Constantes de configuración
define('BASE_UPLOAD_PATH', __DIR__ . '/../uploads/');
// Detectar protocolo automáticamente
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'www.neoidapp.infinityfreeapp.com';
define('BASE_URL', $protocol . '://' . $host . '/');
define('MAX_FILES_PER_EAR', 5);
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Función para crear directorio si no existe
function createDirectoryIfNotExists($path) {
    if (!file_exists($path)) {
        return mkdir($path, 0755, true);
    }
    return true;
}

// Función para validar archivo de imagen
function validateImageFile($file) {
    $errors = [];
    
    // Verificar si el archivo fue subido correctamente
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Error al subir el archivo';
        return $errors;
    }
    
    // Verificar tamaño
    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = 'El archivo es demasiado grande. Máximo ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB';
    }
    
    // Verificar tipo MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    $allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    if (!in_array($mimeType, $allowedMimes)) {
        $errors[] = 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)';
    }
    
    // Verificar extensión
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        $errors[] = 'Extensión de archivo no permitida';
    }
    
    return $errors;
}

// Función para sanitizar nombre de archivo
function sanitizeFileName($filename) {
    // Remover caracteres especiales y espacios
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
    // Limitar longitud
    $filename = substr($filename, 0, 100);
    return $filename;
}

// Función para generar nombre único de archivo
function generateUniqueFileName($tipo, $neonatoId) {
    $timestamp = time();
    $random = substr(md5(uniqid()), 0, 8);
    return "oreja_{$tipo}_{$timestamp}_{$random}.jpg";
}

// Función para contar archivos existentes por tipo
function countFilesByType($neonatoId, $tipo) {
    $neonatoPath = BASE_UPLOAD_PATH . "neonatos/{$neonatoId}/";
    if (!file_exists($neonatoPath)) {
        return 0;
    }
    
    $files = glob($neonatoPath . "oreja_{$tipo}_*");
    return count($files);
}

// Función para obtener todas las fotos de un neonato
function getNeonatoPhotos($neonatoId) {
    $neonatoPath = BASE_UPLOAD_PATH . "neonatos/{$neonatoId}/";
    $photos = [
        'fotos_oreja_derecha' => [],
        'fotos_oreja_izquierda' => []
    ];
    
    if (!file_exists($neonatoPath)) {
        return $photos;
    }
    
    // Buscar fotos de oreja derecha
    $derechaFiles = glob($neonatoPath . "oreja_derecha_*");
    foreach ($derechaFiles as $file) {
        $photos['fotos_oreja_derecha'][] = BASE_URL . 'uploads/neonatos/' . $neonatoId . '/' . basename($file);
    }
    
    // Buscar fotos de oreja izquierda
    $izquierdaFiles = glob($neonatoPath . "oreja_izquierda_*");
    foreach ($izquierdaFiles as $file) {
        $photos['fotos_oreja_izquierda'][] = BASE_URL . 'uploads/neonatos/' . $neonatoId . '/' . basename($file);
    }
    
    return $photos;
}

// Función para eliminar archivo específico
function deletePhotoFile($neonatoId, $filename) {
    $filePath = BASE_UPLOAD_PATH . "neonatos/{$neonatoId}/" . $filename;
    
    if (file_exists($filePath)) {
        return unlink($filePath);
    }
    
    return false;
}

// Función para enviar respuesta JSON
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Función para enviar respuesta de error
function sendErrorResponse($message, $statusCode = 400) {
    sendJsonResponse(['error' => $message], $statusCode);
}
?>
