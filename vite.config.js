import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [ react() ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '~': resolve(__dirname, 'node_modules')
        }
    },
    build: {
        assetsInlineLimit: 1000000, // 1MB, forces Base64 for all images under this size
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (id.includes('node_modules')) {
                        if (id.includes('@nitrots/nitro-renderer')) return 'nitro-renderer';
                        return 'vendor';
                    }
                }
            }
        }
    },
    define: {
        'import.meta.env.DEV_FORCE_INLINE': 'true' // Custom flag to force inline
    }
});
