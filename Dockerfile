# Stage 1: Build static assets using Vite & Node
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve compiled HTML/JS/CSS via high-performance unprivileged Nginx
FROM nginx:alpine

# Remove default nginx configs
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom high-performance SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Container port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
