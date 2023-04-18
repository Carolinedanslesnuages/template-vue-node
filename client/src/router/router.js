import { createRouter, createWebHistory } from 'vue-router'
import localforage from 'localforage'

import store from '@/store/index.js'
import { userRole } from '@/store/current-user.js'

const AppLogin = () => import('@/views/AppLogin.vue')
const UserResetPasswordRequest = () => import('@/views/User/UserResetPasswordRequest.vue')
const UserResetLink = () => import('@/views/User/UserResetLink.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const UserForm = () => import('@/views/User/UserForm.vue')
const UserValidateEmail = () => import('@/views/User/UserValidateEmail.vue')

const vueRoutes = [
  {
    path: '/',
    name: 'login',
    component: AppLogin,
  },
  {
    path: '/utilisateurs/validation-email',
    name: 'user-validate-email',
    component: UserValidateEmail,
  },
  {
    path: '/utilisateurs/inscription',
    name: 'user-create',
    component: UserForm,
  },
  {
    path: '/utilisateurs/reinitialisation-mot-de-passe',
    name: 'user-reset-password',
    component: UserResetPasswordRequest,
  },
  {
    path: '/utilisateurs/reinitialisation-lien',
    name: 'user-reset-link',
    component: UserResetLink,
  },
  {
    path: '/utilisateurs/editer-mon-compte',
    name: 'user-edit',
    component: UserForm,
    meta: {
      isEdit: true,
    },
  },
  {
    path: '/dashboard/',
    name: 'dashboardView',
    component: DashboardView,
  },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'not-found',
  //   component: NotFound,
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes: vueRoutes,
  scrollBehavior (to, _from, _savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
      }
    }
  },
})

router.beforeEach(checkToken)

export default router

async function checkToken (to, from, next) {
  const noTokenRequiredRoutes = [
    'login',
    'user-create',
    'user-validate-email',
    'user-reset-password',
    'user-reset-link',
    'not-found',
  ]
  if (noTokenRequiredRoutes.includes(to.name)) {
    return next()
  }
  if (store.state.connection.offline) {
    return next()
  }
  if (!store.state.currentUser.loggedIn) {
    const token = await localforage.getItem('app-token')
    if (!token) {
      return next({ name: 'login' })
    }
    await store.dispatch('checkToken', token)
    if (!store.state.currentUser.loggedIn) {
      return next({ name: 'login' })
    }
  }
  next()
}

async function checkManagementAccess (to, from, next) {
  const currentUser = store.state.currentUser.roles
  const filterRoleCurrentUser = currentUser.includes(userRole.GESTIONNAIRE)
  if (filterRoleCurrentUser) {
    return next()
  }
  return next({ name: 'dashboardView' })
}
