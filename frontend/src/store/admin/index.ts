import { defineStore } from 'pinia';
import { computed, reactive, ref, type ComputedRef, type Ref } from 'vue';
import {
    fetchAppointments,
    fetchBarbers,
    fetchServices,
    fetchSlots,
    updateAppointment,
} from 'src/services/bookingService';
import type {
    Appointment,
    AppointmentStatus,
    Barber,
    Service,
} from 'src/services/types';
import type { UiMessage } from 'src/store/booking';
import { getApiErrorCode } from 'src/utils/apiError';
import { formatTime } from 'src/utils/format';

export type AdminEditForm = {
    id: number | null;
    barber_id: number | null;
    service_id: number | null;
    client_name: string;
    client_phone: string;
    date: string;
    start_time: string;
    status: AppointmentStatus;
};

const emptyForm = (): AdminEditForm => ({
    id: null,
    barber_id: null,
    service_id: null,
    client_name: '',
    client_phone: '',
    date: '',
    start_time: '',
    status: 'confirmed',
});

export const useAdminStore = defineStore('admin', () => {
    const appointments: Ref<Appointment[]> = ref([]);
    const services: Ref<Service[]> = ref([]);
    const barbers: Ref<Barber[]> = ref([]);
    const slots: Ref<string[]> = ref([]);
    const loading: Ref<boolean> = ref(false);
    const loadingSlots: Ref<boolean> = ref(false);
    const saving: Ref<boolean> = ref(false);
    const filterDate: Ref<string> = ref('');
    const filterStatus: Ref<string> = ref('');
    const message: Ref<UiMessage> = ref(null);
    const lastErrorCode: Ref<string | null> = ref(null);
    const form = reactive<AdminEditForm>(emptyForm());

    const isEditing: ComputedRef<boolean> = computed(() => form.id !== null);

    const canSave: ComputedRef<boolean> = computed(() => {
        return Boolean(
            form.id
            && form.barber_id
            && form.service_id
            && form.client_name.trim()
            && form.client_phone.trim()
            && form.date
            && form.start_time
            && !saving.value,
        );
    });

    const loadCatalog = async (): Promise<void> => {
        const [servicesData, barbersData] = await Promise.all([
            fetchServices(),
            fetchBarbers(),
        ]);

        services.value = servicesData;
        barbers.value = barbersData;
    };

    const loadAppointments = async (): Promise<void> => {
        loading.value = true;
        message.value = null;

        try {
            const params: { date?: string; status?: string } = {};

            if (filterDate.value) {
                params.date = filterDate.value;
            }

            if (filterStatus.value) {
                params.status = filterStatus.value;
            }

            appointments.value = await fetchAppointments(params);
        } catch {
            message.value = { type: 'error', text: 'LOAD_FAILED' };
        } finally {
            loading.value = false;
        }
    };

    const loadSlots = async (): Promise<void> => {
        if (!form.date || !form.barber_id || !form.service_id) {
            slots.value = [];
            return;
        }

        loadingSlots.value = true;

        try {
            const data = await fetchSlots({
                date: form.date,
                barber_id: form.barber_id,
                service_id: form.service_id,
                exclude_appointment_id: form.id ?? undefined,
            });
            slots.value = data.slots;

            if (form.start_time && !slots.value.includes(form.start_time)) {
                slots.value = [form.start_time, ...slots.value];
            }
        } catch {
            slots.value = form.start_time ? [form.start_time] : [];
        } finally {
            loadingSlots.value = false;
        }
    };

    const startEdit = async (appointment: Appointment): Promise<void> => {
        form.id = appointment.id;
        form.barber_id = appointment.barber_id;
        form.service_id = appointment.service_id;
        form.client_name = appointment.client_name;
        form.client_phone = appointment.client_phone;
        form.date = String(appointment.date).slice(0, 10);
        form.start_time = formatTime(appointment.start_time);
        form.status = appointment.status;
        message.value = null;
        lastErrorCode.value = null;
        await loadSlots();
    };

    const cancelEdit = (): void => {
        Object.assign(form, emptyForm());
        slots.value = [];
        lastErrorCode.value = null;
    };

    const save = async (): Promise<boolean> => {
        if (!canSave.value || !form.id || !form.barber_id || !form.service_id) {
            return false;
        }

        saving.value = true;
        message.value = null;
        lastErrorCode.value = null;

        try {
            await updateAppointment(form.id, {
                barber_id: form.barber_id,
                service_id: form.service_id,
                client_name: form.client_name.trim(),
                client_phone: form.client_phone.trim(),
                date: form.date,
                start_time: form.start_time,
                status: form.status,
            });

            message.value = { type: 'ok', text: 'SAVED' };
            await loadAppointments();
            cancelEdit();

            return true;
        } catch (error: unknown) {
            lastErrorCode.value = getApiErrorCode(error);
            message.value = { type: 'error', text: 'SAVE_FAILED' };

            return false;
        } finally {
            saving.value = false;
        }
    };

    return {
        appointments,
        services,
        barbers,
        slots,
        loading,
        loadingSlots,
        saving,
        filterDate,
        filterStatus,
        message,
        lastErrorCode,
        form,
        isEditing,
        canSave,
        loadCatalog,
        loadAppointments,
        loadSlots,
        startEdit,
        cancelEdit,
        save,
    };
});
