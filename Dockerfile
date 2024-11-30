FROM node:20-alpine

WORKDIR /app

# Add necessary build tools for node-gyp
RUN apk add --no-cache python3 make g++ git

# Add user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Copy package files
COPY package*.json ./

# Install dependencies with proper permissions
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    mkdir -p node_modules/.vite && \
    mkdir -p .vite && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app/node_modules && \
    chmod -R 755 /app/.vite

# Copy source files
COPY --chown=appuser:appgroup . .

# Set user
USER appuser

EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]