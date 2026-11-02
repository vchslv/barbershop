import axios, { type AxiosInstance } from 'axios';

const TOKEN_KEY = 'barbershop_admin_token';

let httpClient: AxiosInstance | undefined;

export function getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);

    if (httpClient) {
        httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

export function clearAuthToken(): void {
    localStorage.removeItem(TOKEN_KEY);

    if (httpClient) {
        delete httpClient.defaults.headers.common.Authorization;
    }
}

export function getHttpClient(): AxiosInstance {
    if (!httpClient) {
        httpClient = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const token = getAuthToken();

        if (token) {
            httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
    }

    return httpClient;
}
