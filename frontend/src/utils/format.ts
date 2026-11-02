export const todayIso = (): string => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60_000);

    return local.toISOString().slice(0, 10);
};

export const formatPrice = (value: number, locale: string): string => {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatTime = (value: string): string => {
    return String(value).slice(0, 5);
};

export const formatDate = (value: string, locale: string): string => {
    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
