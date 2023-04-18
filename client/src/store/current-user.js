import localforage from 'localforage'

import api from '@/api/index.js'


export const userRole = {
  GESTIONNAIRE: 'GESTIONNAIRE',
  SUPERADMIN: 'SUPERADMIN',
}

const getDefaultUserState = () => ({
  _id: undefined,
  email: undefined,
  roles: undefined,
  updatedAt: undefined,
  createdAt: undefined,
})

const getDefaultState = () => ({
  isSaving: false,
  loggedIn: undefined,
  deviceLocation: { lat: 45.763699, lng: 4.834777 },
  ...getDefaultUserState(),
})

export default {
  state: getDefaultState(),

  getters: {
    isGestionnaire: state => state.roles?.includes(userRole.GESTIONNAIRE),
  },

  mutations: {
    setFetching (state, isFetching) {
      state.isFetching = isFetching
    },

    login (state) {
      state.loggedIn = true
    },

    logout (state) {
      state.loggedIn = false
    },
    setUser (state, user) {
      const defaultUserState = getDefaultUserState()
      Object.assign(state, defaultUserState, user)
    },

    resetUser (state) {
      const defaultState = getDefaultState()
      Object.assign(state, defaultState)
    },

  },

  actions: {
    async saveCurrentUser ({ commit, dispatch }, userData) {
      try {
        const { message, success, user } = await api.saveUser(userData)
        console.log({"userData":userData})
        commit('setUser', user)
        const type = success ? 'success' : 'error'
        dispatch('setMessage', { type, message })
      } catch (error) {
        const errorMessage = `Impossible de modifier votre profil : ${error.message}` // eslint-disable-line no-irregular-whitespace
        if (userData.createdAt) {
          dispatch('setMessage', { type: 'error', errorMessage })
        }
        dispatch('setMessage', { message: errorMessage, type: 'error' })
      }
    },

    async setFetching ({ commit }, isFetching) {
      commit('setFetching', isFetching)
    },

    resetUser ({ commit }) {
      commit('resetUser')
    },

    async setUser ({ commit }, { user, token }) {
      commit('setUser', user)
      await localforage.setItem('app-token', token)
      await localforage.setItem('app-user', user)
    },

    async authenticate ({ commit, dispatch }, { email, password }) {
      const { message, success, token, user } = await api.requestToken(email, password)
      if (!success) {
        throw new Error(message)
      }
      commit('login')
      dispatch('setMessage', { type: 'success', message: 'Bienvenue ' + user.email, timeout: 2000 })
      await dispatch('setUser', { user, token })
    },

    async logout ({ commit }) {
      commit('logout')
      commit('resetUser')
      await localforage.removeItem('app-token')
      await localforage.removeItem('app-user')
    },

    async checkToken ({ commit, dispatch }, token) {
      try {
        const responseData = await api.verifyToken(token)
        const { user, success, message } = responseData
        if (!success) {
          dispatch('setMessage', { type: 'error', message })
          throw new Error(message)
        }
        commit('setUser', user)
        await localforage.setItem('app-user', user)
        commit('login')
      } catch {
        const user = await localforage.getItem('app-user')
        commit('setUser', user)
      }
    },

  },
}
