# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

# Copy mã nguồn ứng dụng vào container
COPY . .

# Inject biến môi trường trước khi build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Cài đặt dependencies và build dự án
RUN npm install && NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy các file build từ node vào nginx
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Copy cấu hình nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf
