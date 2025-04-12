import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitest } from 'vitest/config';


export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom', // Use jsdom for simulating the browser
        setupFiles: './src/setupTests.js', // Optional setup file if needed
    },
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










