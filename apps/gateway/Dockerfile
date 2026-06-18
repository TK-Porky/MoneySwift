FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

# Au démarrage, on récupère le nameserver de /etc/resolv.conf et on l'injecte dans nginx.conf
CMD /bin/sh -c "export RESOLVER=$(awk 'BEGIN{ORS=\" \"} $1==\"nameserver\" {print $2}' /etc/resolv.conf); sed -i \"s/RESOLVER_IP/$RESOLVER/g\" /etc/nginx/nginx.conf && nginx -g 'daemon off;'"
