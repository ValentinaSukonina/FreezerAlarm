import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    root: '.', // Root directory
    build: {
        copyPublicDir: true,
        outDir: 'dist', // Output directory
        rollupOptions: {
            input: './index.html',
        },
    },
    server: {
        open: true, // Automatically open the browser when running dev server
    },
        proxy: {
        '/api': 'http://localhost:8000', // Proxy API calls to Spring Boot
    }

});










