<?php
/**
 * Gallery API — single-file backend for the multi-gallery system.
 *
 * Deploy this file at /gallery/api.php on your PHP-enabled server.
 * Create an "albums" folder next to it with write permissions.
 *
 * Endpoints
 * ─────────
 * GET  ?action=list_albums
 * GET  ?action=list_images&folder=<album_name>
 * POST ?action=upload          (multipart, images[] + folder)
 * POST ?action=create_album    (form, album_name)
 * POST ?action=delete_image    (form, folder + image)
 * POST ?action=delete_album    (form, album_name)
 *
 * Admin requests must include the header:
 *   X-Admin-Token: <ADMIN_TOKEN>
 */

// ── Configuration ────────────────────────────────────────────────────
define('ADMIN_TOKEN', 'CHANGE_ME');          // ← set your own secret
define('ALBUMS_DIR',  __DIR__ . '/albums');
define('THUMB_WIDTH', 400);                  // px – for auto-generated thumbnails
define('ALLOWED_EXT', ['jpg','jpeg','png','gif','webp','svg']);

// ── CORS (adjust as needed) ──────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

header('Content-Type: application/json; charset=utf-8');

// ── Helpers ──────────────────────────────────────────────────────────
function json_out($data, int $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_admin() {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if ($token !== ADMIN_TOKEN) {
        json_out(['error' => 'Unauthorized'], 403);
    }
}

function safe_name(string $name): string {
    // Allow letters, numbers, spaces, hyphens, underscores
    $name = preg_replace('/[^\w\s\-]/u', '', trim($name));
    return substr($name, 0, 100);
}

function album_path(string $folder): string {
    $safe = basename($folder);
    $path = ALBUMS_DIR . '/' . $safe;
    if (!is_dir($path)) json_out(['error' => 'Album not found'], 404);
    return $path;
}

function web_path(string $folder, string $file): string {
    return '/gallery/albums/' . rawurlencode($folder) . '/' . rawurlencode($file);
}

function thumb_path(string $albumDir, string $file): string {
    $dir = $albumDir . '/thumbs';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return $dir . '/' . $file;
}

function make_thumbnail(string $src, string $dst): bool {
    $info = @getimagesize($src);
    if (!$info) return false;

    [$w, $h, $type] = $info;
    $ratio = THUMB_WIDTH / $w;
    $newW  = THUMB_WIDTH;
    $newH  = (int)($h * $ratio);

    $canvas = imagecreatetruecolor($newW, $newH);

    switch ($type) {
        case IMAGETYPE_JPEG: $image = imagecreatefromjpeg($src); break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($src);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            break;
        case IMAGETYPE_GIF:  $image = imagecreatefromgif($src);  break;
        case IMAGETYPE_WEBP: $image = imagecreatefromwebp($src); break;
        default: return false;
    }

    imagecopyresampled($canvas, $image, 0, 0, 0, 0, $newW, $newH, $w, $h);

    switch ($type) {
        case IMAGETYPE_PNG:  imagepng($canvas, $dst, 8);       break;
        case IMAGETYPE_GIF:  imagegif($canvas, $dst);          break;
        case IMAGETYPE_WEBP: imagewebp($canvas, $dst, 80);     break;
        default:             imagejpeg($canvas, $dst, 80);     break;
    }

    imagedestroy($canvas);
    imagedestroy($image);
    return true;
}

// ── Ensure albums directory exists ───────────────────────────────────
if (!is_dir(ALBUMS_DIR)) {
    mkdir(ALBUMS_DIR, 0755, true);
}

// ── Router ───────────────────────────────────────────────────────────
$action = $_GET['action'] ?? '';

switch ($action) {

    // ─── List albums ─────────────────────────────────────────────────
    case 'list_albums':
        $albums = [];
        foreach (new DirectoryIterator(ALBUMS_DIR) as $item) {
            if ($item->isDot() || !$item->isDir()) continue;
            $name  = $item->getFilename();
            $dir   = $item->getPathname();
            $files = glob($dir . '/*.{jpg,jpeg,png,gif,webp,svg}', GLOB_BRACE | GLOB_NOSORT);
            $thumb = null;
            if ($files) {
                $first = basename($files[0]);
                $tb    = thumb_path($dir, $first);
                if (!file_exists($tb)) make_thumbnail($files[0], $tb);
                $thumb = file_exists($tb)
                    ? web_path($name, 'thumbs/' . $first)
                    : web_path($name, $first);
            }
            $albums[] = [
                'name'      => $name,
                'thumbnail' => $thumb,
                'count'     => count($files),
            ];
        }
        usort($albums, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        json_out($albums);

    // ─── List images in an album ─────────────────────────────────────
    case 'list_images':
        $folder = $_GET['folder'] ?? '';
        if (!$folder) json_out(['error' => 'Missing folder'], 400);
        $dir   = album_path($folder);
        $files = glob($dir . '/*.{jpg,jpeg,png,gif,webp,svg}', GLOB_BRACE | GLOB_NOSORT);
        $images = [];
        foreach ($files as $f) {
            $base = basename($f);
            $tb   = thumb_path($dir, $base);
            if (!file_exists($tb)) make_thumbnail($f, $tb);
            $images[] = [
                'name'      => $base,
                'url'       => web_path($folder, $base),
                'thumbnail' => file_exists($tb)
                    ? web_path($folder, 'thumbs/' . $base)
                    : web_path($folder, $base),
            ];
        }
        usort($images, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        json_out($images);

    // ─── Upload images ───────────────────────────────────────────────
    case 'upload':
        require_admin();
        $folder = $_POST['folder'] ?? '';
        if (!$folder) json_out(['error' => 'Missing folder'], 400);
        $dir = album_path($folder);

        $uploaded = 0;
        $errors   = 0;
        foreach ($_FILES['images']['tmp_name'] ?? [] as $i => $tmp) {
            $name = basename($_FILES['images']['name'][$i]);
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, ALLOWED_EXT)) { $errors++; continue; }
            $dest = $dir . '/' . $name;
            if (move_uploaded_file($tmp, $dest)) {
                make_thumbnail($dest, thumb_path($dir, $name));
                $uploaded++;
            } else {
                $errors++;
            }
        }
        json_out([
            'success' => $uploaded > 0,
            'message' => "$uploaded uploaded" . ($errors ? ", $errors failed" : ''),
        ]);

    // ─── Create album ────────────────────────────────────────────────
    case 'create_album':
        require_admin();
        $name = safe_name($_POST['album_name'] ?? '');
        if (!$name) json_out(['error' => 'Invalid album name'], 400);
        $path = ALBUMS_DIR . '/' . $name;
        if (is_dir($path)) json_out(['error' => 'Album already exists'], 409);
        mkdir($path, 0755, true);
        json_out(['success' => true, 'message' => "Album '$name' created"]);

    // ─── Delete image ────────────────────────────────────────────────
    case 'delete_image':
        require_admin();
        $folder = $_POST['folder'] ?? '';
        $image  = basename($_POST['image'] ?? '');
        if (!$folder || !$image) json_out(['error' => 'Missing params'], 400);
        $dir  = album_path($folder);
        $file = $dir . '/' . $image;
        if (!file_exists($file)) json_out(['error' => 'Image not found'], 404);
        unlink($file);
        $tb = thumb_path($dir, $image);
        if (file_exists($tb)) unlink($tb);
        json_out(['success' => true, 'message' => 'Image deleted']);

    // ─── Delete album ────────────────────────────────────────────────
    case 'delete_album':
        require_admin();
        $name = safe_name($_POST['album_name'] ?? '');
        if (!$name) json_out(['error' => 'Invalid album name'], 400);
        $path = ALBUMS_DIR . '/' . $name;
        if (!is_dir($path)) json_out(['error' => 'Album not found'], 404);
        // Remove all files inside
        foreach (glob($path . '/*') as $f) {
            if (is_file($f)) unlink($f);
        }
        // Remove thumbs
        $thumbDir = $path . '/thumbs';
        if (is_dir($thumbDir)) {
            foreach (glob($thumbDir . '/*') as $f) unlink($f);
            rmdir($thumbDir);
        }
        rmdir($path);
        json_out(['success' => true, 'message' => "Album '$name' deleted"]);

    default:
        json_out(['error' => 'Unknown action'], 400);
}
