import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/',         name: 'home',     component: () => import('@/views/HomeView.vue') },
  { path: '/history',  name: 'history',  component: () => import('@/views/HistoryView.vue') },
  { path: '/schedule', name: 'schedule', component: () => import('@/views/ScheduleView.vue') },
  { path: '/donar',    name: 'donar',    component: () => import('@/views/DonateView.vue') },
  { path: '/contact',  name: 'contact',  component: () => import('@/views/ContactView.vue') },

  {
    path: '/admin',
    component: () => import('@/components/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'donations',
        name: 'admin-donations',
        component: () => import('@/views/admin/DonationsView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'live',
        name: 'admin-live',
        component: () => import('@/views/admin/LiveView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/LoginView.vue'),
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
