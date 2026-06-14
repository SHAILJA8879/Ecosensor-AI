# Stage 1: Build the frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Stage 2: Run the server
FROM node:20-alpine
WORKDIR /app

# Copy server dependencies and install
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production --legacy-peer-deps

# Copy built client assets and server files
COPY --from=client-builder /app/client/dist ./client/dist
COPY server/ ./server/

# Set env
ENV NODE_ENV=production

# Expose port (Cloud Run sets PORT env var)
EXPOSE 5000

# Start the Express server
CMD ["node", "server/src/server.js"]
