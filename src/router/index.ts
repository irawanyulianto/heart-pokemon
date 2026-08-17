import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'Beranda' },
      },
      {
        path: 'pokedex',
        name: 'pokedex',
        component: () => import('../views/PokedexView.vue'),
        meta: { title: 'Pokédex' },
      },
      {
        path: 'compare',
        name: 'compare',
        component: () => import('../views/CompareView.vue'),
        meta: { title: 'Compare' },
      },
      {
        path: 'type-calculator',
        name: 'type-calculator',
        component: () => import('../views/TypeCalculatorView.vue'),
        meta: { title: 'Type Calculator' },
      },
      {
        path: 'pokemon/:id',
        name: 'pokemon',
        component: () => import('../views/PokemonDetailView.vue'),
        props: true,
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('../views/AboutView.vue'),
        meta: { title: 'Tentang' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/NotFoundView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, top: 80 }
    }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const base = 'Pokémon Explorer'
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · ${base}` : base
})

export default router