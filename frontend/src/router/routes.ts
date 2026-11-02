import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'booking',
        component: () => import('src/modules/booking/BookingPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('src/modules/auth/LoginPage.vue'),
        meta: { guestOnly: true },
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('src/modules/auth/RegisterPage.vue'),
        meta: { guestOnly: true },
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: () => import('src/modules/auth/AdminLoginPage.vue'),
        meta: { guestOnly: true },
    },
    {
        path: '/appointments',
        name: 'appointments',
        component: () => import('src/modules/appointments/AppointmentsPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/admin',
        name: 'admin',
        component: () => import('src/modules/admin/AdminPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
];
