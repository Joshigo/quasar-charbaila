import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('pages/ReviewsPage.vue'),
      },
      {
        path: 'contacts',
        name: 'contacts',
        component: () => import('pages/ContactPage.vue'),
      },
      {
        path: 'gallery',
        name: 'gallery',
        component: () => import('pages/GalleryPage.vue'),
      },
    ],
  },

  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
