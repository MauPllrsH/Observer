import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                ref: true,
                exportType: 'default',
            },
            include: '**/*.svg',
        })
    ],
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: true,
        watch: {
            usePolling: true
        },
        proxy: {
            // Proxy API requests to the backend
            '/api': {
                target: process.env.VITE_API_URL || 'http://dashboard_backend:5000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    optimizeDeps: {
        include: ['recharts']
    },
    // Properly load environment variables
    define: {
        'process.env': process.env
    }
});