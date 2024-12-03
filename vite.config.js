import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
        }
    },
    optimizeDeps: {
        include: ['recharts']
    }
});