FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4321

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4321"]
