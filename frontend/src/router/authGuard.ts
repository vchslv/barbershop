export type AuthSnapshot = {
    isAuthenticated: boolean;
    isAdmin: boolean;
};

export type GuardTarget = {
    fullPath: string;
    meta: {
        requiresAuth?: boolean;
        requiresAdmin?: boolean;
        guestOnly?: boolean;
    };
};

export type GuardResult = true | { name: string; query?: { redirect: string } };

export const authRedirect = (to: GuardTarget, auth: AuthSnapshot): GuardResult => {
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return {
            name: 'login',
            query: { redirect: to.fullPath },
        };
    }

    if (to.meta.requiresAdmin && !auth.isAdmin) {
        return { name: 'booking' };
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
        return { name: auth.isAdmin ? 'admin' : 'booking' };
    }

    return true;
};
