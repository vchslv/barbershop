export type AppointmentStatus = 'confirmed' | 'cancelled';

export interface Service {
    id: number;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
}

export interface Barber {
    id: number;
    name: string;
    specialty: string | null;
    is_active: boolean;
}

export interface Appointment {
    id: number;
    barber_id: number;
    service_id: number;
    client_name: string;
    client_phone: string;
    date: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    barber?: Barber;
    service?: Service;
}

export interface SlotsResponse {
    date: string;
    duration_minutes: number;
    slots: string[];
}

export interface CreateAppointmentPayload {
    barber_id: number;
    service_id: number;
    client_name: string;
    client_phone: string;
    date: string;
    start_time: string;
}

export interface UpdateAppointmentPayload {
    barber_id: number;
    service_id: number;
    client_name: string;
    client_phone: string;
    date: string;
    start_time: string;
    status: AppointmentStatus;
}

export interface ApiErrorBody {
    message?: string;
    error_code?: string;
    errors?: Record<string, string[]>;
}
