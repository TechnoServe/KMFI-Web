#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1-}" == apache2* ]] || [[ "${1-}" == php-fpm* ]]; then
    /usr/local/bin/docker-ensure-installed.sh true

    chown -R root:root /var/www/html
    find /var/www/html -type d -exec chmod 0555 {} +
    find /var/www/html -type f -exec chmod 0444 {} +

    mkdir -p /var/www/html/wp-content/uploads
    chown -R www-data:www-data /var/www/html/wp-content/uploads
    find /var/www/html/wp-content/uploads -type d -exec chmod 0755 {} +
    find /var/www/html/wp-content/uploads -type f -exec chmod 0644 {} +
fi

exec "$@"
