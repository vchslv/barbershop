import type { Appointment } from 'src/services/types';
import { formatTime } from 'src/utils/format';

export const canCancelAppointment = (item: Appointment, now = Date.now()): boolean => {
    if (item.status === 'cancelled') {
        return false;
    }

    const start = new Date(`${String(item.date).slice(0, 10)}T${formatTime(item.start_time)}:00`);

    return start.getTime() > now;
};
