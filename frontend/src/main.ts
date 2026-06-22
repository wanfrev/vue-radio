import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { useAuthGuard } from './composables/useAuthGuard';
import { useAuthStore } from './stores/auth';
import './style.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Restore session from persistent cookie before the router guard fires.
const authStore = useAuthStore();
void authStore.fetchMe();

// Register the auth guard.
useAuthGuard(router);

app.mount('#app');
