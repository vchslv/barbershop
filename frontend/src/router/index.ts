import { createRouter, createWebHistory, type Router } from 'vue-router';
import { authRedirect } from 'src/router/authGuard';
import { routes } from 'src/router/routes';
import { useAuthStore } from 'src/store/auth';

let routerInstance: Router | null = null;

export const useAppRouter = (): Router => {
    if (!routerInstance) {
        routerInstance = createRouter({
            routes,
            history: createWebHistory('/'),
            scrollBehavior: () => ({ top: 0 }),
        });

        routerInstance.beforeEach(async (to) => {
            const authStore = useAuthStore();

            if (!authStore.initialized) {
                await authStore.bootstrap();
            }

            return authRedirect(to, {
                isAuthenticated: authStore.isAuthenticated,
                isAdmin: authStore.isAdmin,
            });
        });
    }

    return routerInstance;
};
