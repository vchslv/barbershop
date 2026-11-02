import axios from 'axios';
import type { ApiErrorBody } from 'src/services/types';

const KNOWN_ERROR_CODES = [
    'outside_hours',
    'slot_taken',
    'slot_in_past',
    'already_cancelled',
    'appointment_started',
];

export const getApiErrorCode = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    const data = error.response?.data as ApiErrorBody | undefined;
    const code = data?.error_code || data?.errors?.start_time?.[0] || null;

    if (code && KNOWN_ERROR_CODES.includes(code)) {
        return code;
    }

    return null;
};

export const getFieldErrorCode = (error: unknown, field: string): string | null => {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    const data = error.response?.data as ApiErrorBody | undefined;

    return data?.errors?.[field]?.[0] ?? null;
};
