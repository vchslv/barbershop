import { getHttpClient } from 'src/shared/http-client/getHttpClient';
import type {
    Appointment,
    Barber,
    CreateAppointmentPayload,
    Service,
    SlotsResponse,
    UpdateAppointmentPayload,
} from 'src/services/types';

export async function fetchServices(): Promise<Service[]> {
    const http = getHttpClient();
    const { data } = await http.get<Service[]>('/services');

    return data;
}

export async function fetchBarbers(): Promise<Barber[]> {
    const http = getHttpClient();
    const { data } = await http.get<Barber[]>('/barbers');

    return data;
}

export async function fetchSlots(params: {
    date: string;
    barber_id: number;
    service_id: number;
    exclude_appointment_id?: number;
}): Promise<SlotsResponse> {
    const http = getHttpClient();
    const { data } = await http.get<SlotsResponse>('/appointments/slots', { params });

    return data;
}

export async function fetchAppointments(params: {
    date?: string;
    status?: string;
} = {}): Promise<Appointment[]> {
    const http = getHttpClient();
    const { data } = await http.get<Appointment[]>('/appointments', { params });

    return data;
}

export async function fetchAppointment(id: number): Promise<Appointment> {
    const http = getHttpClient();
    const { data } = await http.get<Appointment>(`/appointments/${id}`);

    return data;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const http = getHttpClient();
    const { data } = await http.post<Appointment>('/appointments', payload);

    return data;
}

export async function updateAppointment(
    id: number,
    payload: UpdateAppointmentPayload,
): Promise<Appointment> {
    const http = getHttpClient();
    const { data } = await http.put<Appointment>(`/appointments/${id}`, payload);

    return data;
}

export async function cancelAppointment(id: number): Promise<void> {
    const http = getHttpClient();
    await http.delete(`/appointments/${id}`);
}

export async function fetchMyAppointments(params: { date?: string } = {}): Promise<Appointment[]> {
    const http = getHttpClient();
    const { data } = await http.get<Appointment[]>('/my/appointments', { params });

    return data;
}

export async function cancelMyAppointment(id: number): Promise<void> {
    const http = getHttpClient();
    await http.post(`/my/appointments/${id}/cancel`);
}
