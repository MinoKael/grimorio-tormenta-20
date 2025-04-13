import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { loadFonts } from './plugins/webfontloader';
import vuetify from './plugins/vuetify';
import './assets/styles/global.css'; 

const app = createApp(App);
loadFonts();
app.use(createPinia());
app.use(vuetify);

app.mount('#app');
