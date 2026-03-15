import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { VNumberInput } from 'vuetify/labs/VNumberInput';

export default createVuetify({
    components: {
        ...components,
        VNumberInput,
    },
    directives,
    theme: {
        defaultTheme: 'dark',
        themes: {
            light: {
                colors: {
                    background: '#FFFCF8', // Light Cream
                    primary: '#FFB53B', // Yellow
                    secondary: '#8BCFF9', // Light Sky Blue
                },
            },
            dark: {
                colors: {
                    background: '#1E1E1E', // Smokie Black
                    surface: '#121212', // Dark Gray
                    primary: '#2B2343', // Dark Purple
                    secondary: '#5CBBF6', // Light Sky Blue
                    tormentaText: '#CE2A28', // Red Tormenta
                },
            },
        },
    },
});
