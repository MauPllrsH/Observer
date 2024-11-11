FROM node:20-alpine

WORKDIR /app

# Install dependencies first (including dev dependencies)
COPY package*.json ./
RUN npm install
RUN npm install @vitejs/plugin-react@latest --save-dev

# Then copy the rest of the files
COPY . .

EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]