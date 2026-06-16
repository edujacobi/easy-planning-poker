# Step 1: Build Frontend
FROM node:22 AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Step 2: Build Backend
FROM node:22 AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --prefix backend
COPY backend/ ./backend/
RUN npm run build --prefix backend

# Step 3: Production Runner
FROM node:22-slim
WORKDIR /app

# Install system dependencies required for native builds (sqlite3 compilation)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY backend/package*.json ./backend/

# Install backend production dependencies (triggers native sqlite3 compile from source)
RUN npm install --prefix backend --omit=dev --build-from-source

# Copy built frontend static assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy built backend compiled files
COPY --from=backend-builder /app/backend/dist ./backend/dist

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "backend/dist/main"]
