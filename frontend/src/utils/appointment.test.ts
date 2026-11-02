import { describe, expect, it } from 'vitest';
import type { Appointment } from 'src/services/types';
import { canCancelAppointment } from 'src/utils/appointment';

const appointment = (overrides: Partial<Appointment> = {}): Appointment => ({
    id: 1,
    barber_id: 1,
    service_id: 1,
    client_name: 'Ivan',
    client_phone: '+79990001122',
    date: '2026-11-02',
    start_time: '15:00:00',
    end_time: '15:30:00',
    status: 'confirmed',
    ...overrides,
});

const at = (iso: string): number => new Date(iso).getTime();

describe('canCancelAppointment', () => {
    it('allows cancelling a confirmed appointment that has not started', () => {
        expect(canCancelAppointment(appointment(), at('2026-11-02T14:00:00'))).toBe(true);
    });

    it('refuses a cancelled appointment and one that has already started', () => {
        const now = at('2026-11-02T15:00:00');

        expect(canCancelAppointment(appointment(), now)).toBe(false);
        expect(canCancelAppointment(appointment({ status: 'cancelled' }), at('2026-11-02T10:00:00'))).toBe(false);
    });
});
