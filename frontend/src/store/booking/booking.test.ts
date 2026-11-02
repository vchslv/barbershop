import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { useBookingStore } from 'src/store/booking';

vi.mock('src/services/bookingService', () => ({
    createAppointment: vi.fn(),
    fetchBarbers: vi.fn(),
    fetchServices: vi.fn(),
    fetchSlots: vi.fn(),
}));

import { createAppointment, fetchSlots } from 'src/services/bookingService';

const readyForm = {
    service_id: 1,
    barber_id: 2,
    date: '2026-11-03',
    start_time: '11:00',
    client_name: '  Ivan  ',
    client_phone: ' +79990001122 ',
};

describe('booking store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(createAppointment).mockReset();
        vi.mocked(fetchSlots).mockReset();
        vi.mocked(fetchSlots).mockResolvedValue({ date: '2026-11-03', duration_minutes: 30, slots: [] });
    });

    it('does not send a booking while the form is incomplete', async () => {
        const store = useBookingStore();

        expect(await store.submit()).toBe(false);
        expect(createAppointment).not.toHaveBeenCalled();
    });

    it('sends trimmed client details and reports a taken slot', async () => {
        const store = useBookingStore();
        Object.assign(store.form, readyForm);
        vi.mocked(createAppointment).mockResolvedValueOnce({} as never);

        expect(await store.submit()).toBe(true);
        expect(createAppointment).toHaveBeenCalledWith({
            service_id: 1,
            barber_id: 2,
            date: '2026-11-03',
            start_time: '11:00',
            client_name: 'Ivan',
            client_phone: '+79990001122',
        });

        Object.assign(store.form, readyForm);
        vi.mocked(createAppointment).mockRejectedValueOnce(new AxiosError(
            'taken',
            '422',
            undefined,
            undefined,
            { data: { error_code: 'slot_taken' }, status: 422, statusText: 'Unprocessable', headers: {}, config: {} as never },
        ));

        expect(await store.submit()).toBe(false);
        expect(store.lastErrorCode).toBe('slot_taken');
        expect(store.message).toEqual({ type: 'error', text: 'CREATE_FAILED' });
    });
});
