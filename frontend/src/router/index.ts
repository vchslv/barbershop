import { createRouter, createWebHistory, type Router } from 'vue-router';
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

            if (to.meta.requiresAuth && !authStore.isAuthenticated) {
                return {
                    name: 'login',
                    query: { redirect: to.fullPath },
                };
            }

            if (to.meta.requiresAdmin && !authStore.isAdmin) {
                return { name: 'booking' };
            }

            if (to.meta.guestOnly && authStore.isAuthenticated) {
                return authStore.isAdmin ? { name: 'admin' } : { name: 'booking' };
            }

            return true;
        });
    }

    return routerInstance;
};
