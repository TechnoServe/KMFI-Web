<?php
/**
 * Plugin Name: KMFI Runtime Security
 * Description: Security controls for the immutable Cloud Run deployment.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('xmlrpc_enabled', '__return_false');
add_filter('wp_is_application_passwords_available', '__return_false');
add_filter('the_generator', '__return_empty_string');
remove_action('wp_head', 'wp_generator');

add_filter('wp_handle_upload_prefilter', static function (array $file): array {
    $name = strtolower((string) ($file['name'] ?? ''));
    if (preg_match('/\.(?:php\d*|phtml|phar|cgi|pl|py|sh)(?:\.|$)/i', $name)) {
        $file['error'] = 'Executable uploads are not permitted.';
    }
    return $file;
});

add_filter('upload_mimes', static function (array $mimes): array {
    foreach (array_keys($mimes) as $extension) {
        if (preg_match('/(?:php|phtml|phar|cgi|pl|py|sh)/i', (string) $extension)) {
            unset($mimes[$extension]);
        }
    }
    return $mimes;
});
