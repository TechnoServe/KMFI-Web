FROM europe-west1-docker.pkg.dev/ignite-program/kmfi-wp-repo/wordpress@sha256:54521c83f8e226990b7441649b19cda9bcb2649d0ad07d5d14c8fb957bdfaf1d AS legacy

FROM wordpress:6.9-php8.2-apache@sha256:29a3af5db27d8c1716367575280bbf449cd231ced707daf8ce411895c042ed76

COPY --from=legacy /var/www/html/wp-content/ /usr/src/wordpress/wp-content/
COPY kmfi-security.php /tmp/kmfi-security.php
COPY apache-hardening.conf /etc/apache2/conf-available/kmfi-hardening.conf
COPY php-hardening.ini /usr/local/etc/php/conf.d/zz-kmfi-hardening.ini
COPY kmfi-entrypoint.sh /usr/local/bin/kmfi-entrypoint.sh

RUN set -eux; \
    apt-get update; \
    apt-get upgrade -y; \
    rm -rf /var/lib/apt/lists/*; \
    rm -rf \
      /usr/src/wordpress/wp-content/plugins/akismet \
      /usr/src/wordpress/wp-content/plugins/gravityforms \
      /usr/src/wordpress/wp-content/plugins/tawkto-live-chat \
      /usr/src/wordpress/wp-content/plugins/wordpress-importer \
      /usr/src/wordpress/wp-content/plugins/wpforms-lite \
      /usr/src/wordpress/wp-content/plugins/hello.php; \
    mkdir -p /usr/src/wordpress/wp-content/mu-plugins; \
    install -m 0444 -o root -g root /tmp/kmfi-security.php /usr/src/wordpress/wp-content/mu-plugins/kmfi-security.php; \
    chmod 0555 /usr/local/bin/kmfi-entrypoint.sh; \
    a2enmod headers rewrite; \
    a2enconf kmfi-hardening; \
    rm -f /tmp/kmfi-security.php

ENTRYPOINT ["kmfi-entrypoint.sh"]
CMD ["apache2-foreground"]
