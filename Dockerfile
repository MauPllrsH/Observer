FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["npm", "run", "dev"]