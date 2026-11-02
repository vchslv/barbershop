import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    test: {
        environment: 'happy-dom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'],
            include: ['src/**/*.{ts,vue}'],
            exclude: ['src/**/*.test.ts'],
        },
    },
    resolve: {
        alias: {
            src: fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
});
