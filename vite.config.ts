import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/nvidia': {
            target: 'https://integrate.api.nvidia.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
          },
        },
      },
      plugins: [react()],
      // 🛡️ Sentinel: Removed insecure 'define' block that leaked legacy keys.
      // Vite handles 'VITE_' prefixed env variables automatically via import.meta.env.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
