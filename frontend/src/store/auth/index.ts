import { defineStore } from 'pinia';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import {
    fetchMe,
    loginAdmin as loginAdminRequest,
    loginWithPhone as loginWithPhoneRequest,
    logoutRequest,
    register as registerRequest,
    type AuthUser,
} from 'src/services/authService';
import { clearAuthToken, getAuthToken, setAuthToken } from 'src/shared/http-client/getHttpClient';

const USER_KEY = 'barbershop_auth_user';

const readStoredUser = (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
};

export const useAuthStore = defineStore('auth', () => {
    const token: Ref<string | null> = ref(getAuthToken());
    const user: Ref<AuthUser | null> = ref(readStoredUser());
    const loading: Ref<boolean> = ref(false);
    const initialized: Ref<boolean> = ref(false);

    const isAuthenticated: ComputedRef<boolean> = computed(() => Boolean(token.value && user.value));
    const isAdmin: ComputedRef<boolean> = computed(() => user.value?.role === 'admin');

    const persistUser = (next: AuthUser | null): void => {
        user.value = next;

        if (next) {
            localStorage.setItem(USER_KEY, JSON.stringify(next));
        } else {
            localStorage.removeItem(USER_KEY);
        }
    };

    const applyAuth = (authToken: string, nextUser: AuthUser): void => {
        token.value = authToken;
        setAuthToken(authToken);
        persistUser(nextUser);
    };

    const register = async (payload: {
        name: string;
        phone: string;
        password: string;
    }): Promise<void> => {
        loading.value = true;

        try {
            const data = await registerRequest(payload);
            applyAuth(data.token, data.user);
        } finally {
            loading.value = false;
        }
    };

    const loginWithPhone = async (phone: string, password: string): Promise<void> => {
        loading.value = true;

        try {
            const data = await loginWithPhoneRequest(phone, password);
            applyAuth(data.token, data.user);
        } finally {
            loading.value = false;
        }
    };

    const loginAdmin = async (email: string, password: string): Promise<void> => {
        loading.value = true;

        try {
            const data = await loginAdminRequest(email, password);
            applyAuth(data.token, data.user);
        } finally {
            loading.value = false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            if (token.value) {
                await logoutRequest();
            }
        } catch {
            // ignore network errors on logout
        } finally {
            token.value = null;
            clearAuthToken();
            persistUser(null);
        }
    };

    const bootstrap = async (): Promise<void> => {
        if (!token.value) {
            persistUser(null);
            initialized.value = true;
            return;
        }

        try {
            const me = await fetchMe();
            persistUser(me);
        } catch {
            token.value = null;
            clearAuthToken();
            persistUser(null);
        } finally {
            initialized.value = true;
        }
    };

    return {
        token,
        user,
        loading,
        initialized,
        isAuthenticated,
        isAdmin,
        register,
        loginWithPhone,
        loginAdmin,
        logout,
        bootstrap,
    };
});
