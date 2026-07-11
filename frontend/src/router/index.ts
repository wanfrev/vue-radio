import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const AdminLayout = () => import('@/components/admin/AdminLayout.vue');

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'donations', name: 'admin-donations', component: () => import('@/views/admin/DonationsView.vue') },
      { path: 'studio/guide', name: 'admin-studio-guide', component: () => import('@/views/admin/StudioGuide.vue') },
    ],
  },
  { path: '/admin/login', name: 'admin-login', component: () => import('@/views/admin/LoginView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});
