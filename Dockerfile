FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --production

# Copy built application and start script from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/start.mjs ./start.mjs

# Copy tutorials content and metadata files needed at runtime
COPY --from=builder /app/tutorials ./tutorials
COPY --from=builder /app/tutorial-metadata.json ./tutorial-metadata.json
COPY --from=builder /app/author-metadata.json ./author-metadata.json
COPY --from=builder /app/manage-metadata.js ./manage-metadata.js

# Expose port (Zeabur will override this with PORT env var)
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", "start.mjs"]
