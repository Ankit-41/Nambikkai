# ---- Builder: compile TS to JS ----
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Install dependencies
    COPY backend/package*.json ./
    RUN npm ci
    
    # Copy source and tsconfig
    COPY backend/tsconfig.json ./
    COPY backend/ ./
    
    # Build to dist/
    RUN npm run build
    
    # ---- Runner: prod node with only prod deps ----
    FROM node:20-alpine
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Install prod deps only
    COPY backend/package*.json ./
    RUN npm ci --omit=dev
    
    # Copy build output and any runtime files needed
    COPY --from=builder /app/dist ./dist
    
    # If you have non-TS assets (e.g. email templates), copy them too:
    # COPY --from=builder /app/assets ./assets
    
    EXPOSE 5000
    CMD ["node", "dist/server.js"]
    