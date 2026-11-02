import { getHttpClient } from 'src/shared/http-client/getHttpClient';

export type UserRole = 'admin' | 'client';

export interface AuthUser {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: UserRole;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export async function register(payload: {
    name: string;
    phone: string;
    password: string;
}): Promise<AuthResponse> {
    const http = getHttpClient();
    const { data } = await http.post<AuthResponse>('/register', payload);

    return data;
}

export async function loginWithPhone(phone: string, password: string): Promise<AuthResponse> {
    const http = getHttpClient();
    const { data } = await http.post<AuthResponse>('/login', { phone, password });

    return data;
}

export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
    const http = getHttpClient();
    const { data } = await http.post<AuthResponse>('/admin/login', { email, password });

    return data;
}

export async function fetchMe(): Promise<AuthUser> {
    const http = getHttpClient();
    const { data } = await http.get<AuthUser>('/me');

    return data;
}

export async function logoutRequest(): Promise<void> {
    const http = getHttpClient();
    await http.post('/logout');
}
