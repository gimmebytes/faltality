# Stage 1: Build static assets with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install clean dependencies
RUN npm ci

# Copy source files
COPY . .

# Build production bundle with TypeScript & Vite
RUN npm run build

# Stage 2: Serve production assets via lightweight Nginx Alpine
FROM nginx:alpine AS runner

# Remove default nginx configs
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom high-performance SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Container port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
