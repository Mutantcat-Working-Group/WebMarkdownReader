# Static website image: serves the checked-in site with nginx.
FROM nginx:1.27-alpine AS runtime

ARG VERSION=1.0.20260920

COPY . /usr/share/nginx/html

LABEL org.opencontainers.image.version="${VERSION}"

EXPOSE 80
