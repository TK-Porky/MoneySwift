#!/bin/sh
set -e

# Extraire l'IP du nameserver de manière plus simple
RESOLVER_IP=$(grep nameserver /etc/resolv.conf | head -n 1 | cut -d' ' -f2)

# Si vide, on utilise Google DNS comme fallback
if [ -z "$RESOLVER_IP" ]; then
    RESOLVER_IP="8.8.8.8"
fi

echo "DNS Resolver detected: $RESOLVER_IP"

# Remplacer le placeholder dans la config nginx
sed -i "s/RESOLVER_IP/$RESOLVER_IP/g" /etc/nginx/nginx.conf

# Lancer Nginx
exec nginx -g 'daemon off;'
