import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/layouts/AdminLayout.vue';

/**
 * Configuração das rotas da aplicação
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========================================
    // ROTAS PÚBLICAS
    // ========================================
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Início - TrocaAi' }
    },
    {
      path: '/mapa',
      name: 'mapa',
      component: () => import('@/views/MapView.vue'),
      meta: { title: 'Mapa de Itens - TrocaAi' }
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/LandingHome.vue'),
      meta: { title: 'TrocaAi - Início' }
    },
    {
      path: '/mapa-landing',
      name: 'mapa-landing',
      component: () => import('@/views/MapLanding.vue'),
      meta: { title: 'Mapa - TrocaAi' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Login - TrocaAi', guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Cadastro - TrocaAi', guest: true }
    },
    {
      path: '/items/:id',
      name: 'item-details',
      component: () => import('@/views/ItemDetailsView.vue'),
      meta: { title: 'Detalhes do Item - TrocaAi' }
    },

    // ========================================
    // ROTAS PROTEGIDAS (requer autenticação)
    // ========================================
    {
      path: '/meus-itens',
      name: 'my-items',
      component: () => import('@/views/MyItemsView.vue'),
      meta: { title: 'Meus Itens - TrocaAi', requiresAuth: true }
    },
    {
      path: '/novo-item',
      name: 'new-item',
      component: () => import('@/views/NewItemView.vue'),
      meta: { title: 'Novo Item - TrocaAi', requiresAuth: true }
    },
    {
      path: '/editar-item/:id',
      name: 'edit-item',
      component: () => import('@/views/EditItemView.vue'),
      meta: { title: 'Editar Item - TrocaAi', requiresAuth: true }
    },
    {
      path: '/propostas',
      name: 'my-proposals',
      component: () => import('@/views/MyProposalsView.vue'),
      meta: { title: 'Minhas Propostas - TrocaAi', requiresAuth: true }
    },
    {
      path: '/propostas-recebidas',
      name: 'received-proposals',
      component: () => import('@/views/ReceivedProposalsView.vue'),
      meta: { title: 'Propostas Recebidas - TrocaAi', requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'Meu Perfil - TrocaAi', requiresAuth: true }
    },
    {
      path: '/perfil/:id',
      name: 'user-profile',
      component: () => import('@/views/UserProfileView.vue'),
      meta: { title: 'Perfil do Usuário - TrocaAi' }
    },

    {
      path: '/meus-favoritos',
      name: 'my-favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { title: 'Meus Favoritos - TrocaAi', requiresAuth: true }
    },

    // ========================================
    // ROTAS ADMIN (requer role admin)
    // ========================================
     {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '', // Rota raiz /admin
          name: 'admin-dashboard',
          component: () => import('@/views/AdminView.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'users', // Rota /admin/users
          name: 'admin-users',
          component: () => import('@/views/admin/UsersView.vue'),
          meta: { title: 'Usuários' }
        },
        {
          path: 'items', // Rota /admin/items
          name: 'admin-items',
          component: () => import('@/views/admin/ItemsView.vue'),
          meta: { title: 'Itens' }
        },
        {
          path: 'reports', // Rota /admin/reports
          name: 'admin-reports',
          component: () => import('@/views/admin/ReportsView.vue'),
          meta: { title: 'Denúncias' }
        },
        {
          path: 'ratings', // Rota /admin/ratings
          name: 'admin-ratings',
          component: () => import('@/views/admin/AdminRatingsView.vue'),
          meta: { title: 'Avaliações' }
        },
      ]
    },


    // ========================================
    // 404
    // ========================================
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Página não encontrada - TrocaAi' }
    }
  ]
});

/**
 * Guard de navegação
 * Verifica autenticação e permissões antes de acessar rotas
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Atualiza o título da página
  document.title = (to.meta.title as string) || 'TrocaAi';

  // Rota requer autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Rota requer admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' });
    return;
  }

  // Rota é apenas para guests (não logados)
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
