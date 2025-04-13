import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';



export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,          // Use global test functions like "it", "describe"
        environment: 'jsdom',   // Set jsdom as the test environment
        setupFiles: './setupTests.js', // Optional: path for a setup file if needed
        include: ['**/*.{test,spec}.{js,jsx}'], // Ensure the test files are detected
        coverage: {
            provider: 'c8', // or 'istanbul'
            reporter: ['text', 'lcov'], // this generates text in terminal + HTML report
            reportsDirectory: './coverage',
            exclude: ['node_modules/', 'tests/'],
        },
        mockReset: true, // Automatically reset mocks between tests
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










