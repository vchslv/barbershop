import { defineStore } from 'pinia';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { Composer } from 'vue-i18n';
import { getI18n } from 'src/shared/i18n';

const STORAGE_KEY = 'barbershop_locale';
const supported = ['en'] as const;

export type AppLocale = typeof supported[number];

const resolveInitialLocale = (): AppLocale => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && supported.includes(saved as AppLocale)) {
        return saved as AppLocale;
    }

    return 'en';
};

export const useLocaleStore = defineStore('locale', () => {
    const locale: Ref<AppLocale> = ref(resolveInitialLocale());

    const isEn: ComputedRef<boolean> = computed(() => locale.value === 'en');

    const setLocale = async (next: AppLocale): Promise<void> => {
        if (!supported.includes(next)) {
            return;
        }

        locale.value = next;
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;

        const i18n = await getI18n();
        const composer = i18n.global as unknown as Composer;
        composer.locale.value = next;
        document.title = String(composer.t('common.meta.title'));
    };

    const initDocumentMeta = async (): Promise<void> => {
        document.documentElement.lang = locale.value;
        const i18n = await getI18n();
        const composer = i18n.global as unknown as Composer;
        document.title = String(composer.t('common.meta.title'));
    };

    return {
        locale,
        isEn,
        setLocale,
        initDocumentMeta,
    };
});
