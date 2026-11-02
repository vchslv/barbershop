import 'src/style/main.css';

import { createApp } from 'vue';
import App from 'src/App.vue';
import { usePinia } from 'src/plugins/pinia';
import { useI18n } from 'src/plugins/i18n';
import { useAppRouter } from 'src/router';
import { useLocaleStore } from 'src/store/locale';

const init = async (): Promise<void> => {
    const app = createApp(App);

    usePinia(app);

    const localeStore = useLocaleStore();
    await useI18n(app, localeStore.locale);
    await localeStore.initDocumentMeta();

    app.use(useAppRouter());
    app.mount('#app');
};

init();
