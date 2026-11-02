import { defineStore } from 'pinia';
import { computed, reactive, ref, type ComputedRef, type Ref } from 'vue';
import {
    createAppointment,
    fetchBarbers,
    fetchServices,
    fetchSlots,
} from 'src/services/bookingService';
import type { Barber, Service } from 'src/services/types';
import { getApiErrorCode } from 'src/utils/apiError';
import { todayIso } from 'src/utils/format';

export type UiMessage = {
    type: 'ok' | 'error';
    text: string;
} | null;

export const useBookingStore = defineStore('booking', () => {
    const services: Ref<Service[]> = ref([]);
    const barbers: Ref<Barber[]> = ref([]);
    const slots: Ref<string[]> = ref([]);
    const loadingSlots: Ref<boolean> = ref(false);
    const submitting: Ref<boolean> = ref(false);
    const message: Ref<UiMessage> = ref(null);
    const lastErrorCode: Ref<string | null> = ref(null);
    const lastSuccess: Ref<{ name: string; date: string; time: string } | null> = ref(null);

    const form = reactive({
        service_id: null as number | null,
        barber_id: null as number | null,
        date: todayIso(),
        start_time: '',
        client_name: '',
        client_phone: '',
    });

    const selectedService: ComputedRef<Service | null> = computed(() => {
        return services.value.find((item) => item.id === form.service_id) || null;
    });

    const canLoadSlots: ComputedRef<boolean> = computed(() => {
        return Boolean(form.service_id && form.barber_id && form.date);
    });

    const canSubmit: ComputedRef<boolean> = computed(() => {
        return Boolean(
            canLoadSlots.value
            && form.start_time
            && form.client_name.trim()
            && form.client_phone.trim()
            && !submitting.value,
        );
    });

    const showMessage = (type: 'ok' | 'error', text: string): void => {
        message.value = { type, text };
    };

    const clearMessage = (): void => {
        message.value = null;
        lastErrorCode.value = null;
        lastSuccess.value = null;
    };

    const loadCatalog = async (): Promise<void> => {
        const [servicesData, barbersData] = await Promise.all([
            fetchServices(),
            fetchBarbers(),
        ]);

        services.value = servicesData;
        barbers.value = barbersData;

        if (services.value.length && !form.service_id) {
            form.service_id = services.value[0].id;
        }

        if (barbers.value.length && !form.barber_id) {
            form.barber_id = barbers.value[0].id;
        }
    };

    const loadSlots = async (): Promise<void> => {
        if (!canLoadSlots.value || !form.service_id || !form.barber_id) {
            slots.value = [];
            return;
        }

        loadingSlots.value = true;
        form.start_time = '';

        try {
            const data = await fetchSlots({
                date: form.date,
                barber_id: form.barber_id,
                service_id: form.service_id,
            });
            slots.value = data.slots;

            if (!slots.value.length) {
                if (message.value?.type !== 'ok') {
                    showMessage('error', 'NO_SLOTS');
                }
            } else if (message.value?.type === 'error' && message.value.text === 'NO_SLOTS') {
                clearMessage();
            }
        } catch (error: unknown) {
            slots.value = [];
            lastErrorCode.value = getApiErrorCode(error);
            showMessage('error', 'SLOTS_LOAD_FAILED');
        } finally {
            loadingSlots.value = false;
        }
    };

    const submit = async (): Promise<boolean> => {
        if (!canSubmit.value || !form.service_id || !form.barber_id) {
            return false;
        }

        submitting.value = true;
        clearMessage();

        try {
            const payload = {
                service_id: form.service_id,
                barber_id: form.barber_id,
                date: form.date,
                start_time: form.start_time,
                client_name: form.client_name.trim(),
                client_phone: form.client_phone.trim(),
            };

            await createAppointment(payload);

            lastSuccess.value = {
                name: payload.client_name,
                date: payload.date,
                time: payload.start_time,
            };
            showMessage('ok', 'SUCCESS');
            form.client_name = '';
            form.client_phone = '';
            form.start_time = '';
            await loadSlots();

            return true;
        } catch (error: unknown) {
            lastErrorCode.value = getApiErrorCode(error);
            showMessage('error', 'CREATE_FAILED');

            return false;
        } finally {
            submitting.value = false;
        }
    };

    return {
        services,
        barbers,
        slots,
        loadingSlots,
        submitting,
        message,
        lastErrorCode,
        lastSuccess,
        form,
        selectedService,
        canLoadSlots,
        canSubmit,
        showMessage,
        clearMessage,
        loadCatalog,
        loadSlots,
        submit,
    };
});

