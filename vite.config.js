import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,  // Expose to all network interfaces
        port: 3000,  // Match the port in docker-compose
        watch: {
            usePolling: true  // Necessary for Docker on some systems
        }
    }
})