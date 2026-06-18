#!/bin/sh
set -e

# Extraire le premier nameserver de /etc/resolv.conf
# On utilise sed pour être sûr de ne récupérer que l'IP
RESOLVER_IP=$(grep nameserver /etc/resolv.conf | head -n 1 | awk '{print $2}')

echo "DNS Resolver detected: $RESOLVER_IP"

# Remplacer le placeholder dans la config nginx
sed -i "s/RESOLVER_IP/$RESOLVER_IP/g" /etc/nginx/nginx.conf

# Lancer Nginx
exec nginx -g 'daemon off;'
