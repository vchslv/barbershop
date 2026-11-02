import { createPinia } from 'pinia';
import type { App } from 'vue';

export const usePinia = (app: App): void => {
    const pinia = createPinia();
    app.use(pinia);
};
