FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

COPY package*.json ./
RUN npm install && \
    mkdir -p node_modules/.vite && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app/node_modules

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3000

CMD ["npm", "run", "dev"]