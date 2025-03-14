import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        extensions: ['.js', '.jsx'], // Ensure these file types are resolved
    },
    root: '.', // Root directory
    build: {
        copyPublicDir: true,
        outDir: 'dist', // Output directory
        rollupOptions: {
            input: './index.html', // Correct path to your index.html
        },
    },
    server: {
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            }
        }
    }
});










