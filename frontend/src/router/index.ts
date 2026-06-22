import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useSidePanelStore, type SidePanelTab } from '@/stores/sidePanel';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/history', redirect: '/' },
  { path: '/schedule', redirect: '/' },
  { path: '/donar', redirect: '/' },
  { path: '/contact', redirect: '/' },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { requiresAuth: true } },
      { path: 'donations', name: 'admin-donations', component: () => import('@/views/admin/DonationsView.vue'), meta: { requiresAuth: true } },
      { path: 'live', name: 'admin-live', component: () => import('@/views/admin/LiveView.vue'), meta: { requiresAuth: true } },
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

router.beforeEach((to) => {
  const tabMap: Record<string, SidePanelTab> = { '/history': 'history', '/schedule': 'schedule', '/donar': 'donate', '/contact': 'contact' };
  const tab = tabMap[to.path];
  if (tab) { useSidePanelStore().openTab(tab); return { path: '/' }; }
  return true;
});
