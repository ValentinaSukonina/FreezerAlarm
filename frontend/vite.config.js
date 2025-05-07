import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './setupTests.js',
        include: ['**/*.{test,spec}.{js,jsx}'],
        mockReset: true,
        coverage: {
            enabled: true,
            provider: 'v8',
            reportsDirectory: './coverage',
            reporter: ['text', 'lcov'],
            exclude: ['node_modules/', 'tests/', 'vite.config.js', 'src/main.jsx', ],
        },
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    root: '.',
    build: {
        copyPublicDir: true,
        outDir: 'dist',
        rollupOptions: {
            input: './index.html',
        },
    },
    server: {
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});











