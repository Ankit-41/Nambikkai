# ---- Builder: build Vite static site ----
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    COPY frontend/package*.json ./
    RUN npm ci
    
    # Copy source
    COPY frontend/ ./
    
    # Pass API URL at build time (defaults to /api)
    ARG VITE_API_URL=/api
    ENV VITE_API_URL=${VITE_API_URL}
    
    # Build
    RUN npm run build
    
    # ---- Runtime: Nginx serving static & proxy /api to backend ----
    FROM nginx:1.27-alpine
    
    # Copy built assets
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Replace default site with our SPA + API proxy
    COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    