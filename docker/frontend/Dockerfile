FROM node:20-alpine AS builder

WORKDIR /app

COPY ez_tro_app/package*.json ./
RUN npm ci

COPY ez_tro_app/.babelrc ./
COPY ez_tro_app/config-overrides.js ./
COPY ez_tro_app/jsconfig.json ./
COPY ez_tro_app/webpack.config.js ./
COPY ez_tro_app/public ./public
COPY ez_tro_app/src ./src

ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
ARG REACT_APP_MINIO_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_WS_URL=${REACT_APP_WS_URL}
ENV REACT_APP_MINIO_URL=${REACT_APP_MINIO_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
