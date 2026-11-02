import { Composer, createI18n as createVueI18n, I18n, useI18n } from 'vue-i18n';

const getMessages = async (): Promise<Record<string, any>> => {
    const files = import.meta.glob('src/**/i18n/*.json');
    const messages: Record<string, any> = {};

    for (const path in files) {
        const raw = await files[path]() as Record<string, any>;
        const data = raw.default;
        const locale = path.split('/').pop()!.replace('.json', '');

        if (!messages[locale]) {
            messages[locale] = {};
        }

        messages[locale] = {
            ...messages[locale],
            ...data,
        };
    }

    return messages;
};

const createI18n = async (locale = 'en'): Promise<I18n> => {
    const messages = await getMessages();

    return createVueI18n({
        legacy: false,
        locale,
        fallbackLocale: 'en',
        messages,
    });
};

let i18n: I18n;

export const getI18n = async (locale = 'en'): Promise<I18n> => {
    if (!i18n) {
        i18n = await createI18n(locale);
    }

    return i18n;
};

export const getI18nGlobal = async (): Promise<Composer> => {
    const instance = await getI18n();

    return instance.global as unknown as Composer;
};

/**
 * must be called at setup
 * @param langPrefix - translation key prefix
 */
export const useTranslate = (
    langPrefix: string,
): ((key: string, values?: Record<string, unknown>) => string) => {
    const { t } = useI18n();

    return (key: string, values: Record<string, unknown> = {}): string => {
        return t(`${langPrefix}.${key}`, values);
    };
};
