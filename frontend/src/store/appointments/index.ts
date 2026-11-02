import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import { cancelMyAppointment, fetchMyAppointments } from 'src/services/bookingService';
import type { Appointment } from 'src/services/types';
import type { UiMessage } from 'src/store/booking';
import { getApiErrorCode } from 'src/utils/apiError';

export const useAppointmentsStore = defineStore('appointments', () => {
    const appointments: Ref<Appointment[]> = ref([]);
    const loading: Ref<boolean> = ref(false);
    const filterDate: Ref<string> = ref('');
    const message: Ref<UiMessage> = ref(null);
    const lastErrorCode: Ref<string | null> = ref(null);

    const loadAppointments = async (): Promise<void> => {
        loading.value = true;
        message.value = null;

        try {
            const params: { date?: string } = {};

            if (filterDate.value) {
                params.date = filterDate.value;
            }

            appointments.value = await fetchMyAppointments(params);
        } catch {
            message.value = { type: 'error', text: 'LOAD_FAILED' };
        } finally {
            loading.value = false;
        }
    };

    const resetFilter = async (): Promise<void> => {
        filterDate.value = '';
        await loadAppointments();
    };

    const cancel = async (id: number): Promise<boolean> => {
        lastErrorCode.value = null;

        try {
            await cancelMyAppointment(id);
            await loadAppointments();
            message.value = { type: 'ok', text: 'CANCELLED_OK' };

            return true;
        } catch (error: unknown) {
            lastErrorCode.value = getApiErrorCode(error);
            message.value = { type: 'error', text: 'CANCEL_FAILED' };

            return false;
        }
    };

    return {
        appointments,
        loading,
        filterDate,
        message,
        lastErrorCode,
        loadAppointments,
        resetFilter,
        cancel,
    };
});
