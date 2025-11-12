import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/madres',
    name: 'Madres',
    component: () => import('../views/MadresList.vue'),
  },
  {
    path: '/madres/nueva',
    name: 'NuevaMadre',
    component: () => import('../views/MadreForm.vue'),
  },
  {
    path: '/madres/:id',
    name: 'EditarMadre',
    component: () => import('../views/MadreForm.vue'),
  },
  {
    path: '/neonatos',
    name: 'Neonatos',
    component: () => import('../views/NeonatosList.vue'),
  },
  {
    path: '/neonatos/nuevo',
    name: 'NuevoNeonato',
    component: () => import('../views/NeonatoForm.vue'),
  },
  {
    path: '/neonatos/:id',
    name: 'EditarNeonato',
    component: () => import('../views/NeonatoForm.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
  },
  {
    path: '/firebase-evidence',
    name: 'FirebaseEvidence',
    component: () => import('../views/FirebaseEvidenceView.vue'),
  },
  {
    path: '/qr-scanner',
    name: 'QRScanner',
    component: () => import('../views/QRScannerView.vue'),
  },
  {
    path: '/ear-recognition',
    name: 'EarRecognition',
    component: () => import('../views/EarRecognitionView.vue'),
  },
  {
    path: '/herramientas/datamatrix',
    name: 'DataMatrixGenerator',
    component: () => import('../views/DataMatrixGeneratorView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
