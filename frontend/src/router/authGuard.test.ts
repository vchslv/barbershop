import { describe, expect, it } from 'vitest';
import { authRedirect, type AuthSnapshot } from 'src/router/authGuard';

const guest: AuthSnapshot = { isAuthenticated: false, isAdmin: false };
const client: AuthSnapshot = { isAuthenticated: true, isAdmin: false };
const admin: AuthSnapshot = { isAuthenticated: true, isAdmin: true };

describe('authRedirect', () => {
    it('sends a guest from a protected page to login and keeps the return path', () => {
        expect(authRedirect({ fullPath: '/appointments', meta: { requiresAuth: true } }, guest)).toEqual({
            name: 'login',
            query: { redirect: '/appointments' },
        });
    });

    it('keeps a client out of the admin panel', () => {
        expect(authRedirect({
            fullPath: '/admin',
            meta: { requiresAuth: true, requiresAdmin: true },
        }, client)).toEqual({ name: 'booking' });
    });

    it('lets an admin open the admin panel', () => {
        expect(authRedirect({
            fullPath: '/admin',
            meta: { requiresAuth: true, requiresAdmin: true },
        }, admin)).toBe(true);
    });

    it('sends an already signed-in user away from the login page', () => {
        expect(authRedirect({ fullPath: '/login', meta: { guestOnly: true } }, client)).toEqual({ name: 'booking' });
        expect(authRedirect({ fullPath: '/login', meta: { guestOnly: true } }, admin)).toEqual({ name: 'admin' });
    });
});
