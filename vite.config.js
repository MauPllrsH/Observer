import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSvgr from 'vite-plugin-svgr'

export default defineConfig({
    plugins: [react(), vitePluginSvgr()],
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