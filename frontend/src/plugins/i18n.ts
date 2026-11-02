import type { App } from 'vue';
import { getI18n } from 'src/shared/i18n';

export const useI18n = async (app: App, locale = 'en'): Promise<void> => {
    const i18n = await getI18n(locale);
    app.use(i18n);
};
