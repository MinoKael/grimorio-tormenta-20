import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {    
    const isProduction = mode === 'production';
    return {
        build: {
            target: "es2022"
        },
        base: isProduction ? '/grimorio-tormenta-20/' : '/',
        plugins: [
            vue({
                template: { transformAssetUrls},
            }),
            vuetify({
                autoImport: true,
            }),
        ],
    }
})
