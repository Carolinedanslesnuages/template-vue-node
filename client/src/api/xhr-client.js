import axios from 'axios'
import localforage from 'localforage'

import store from '@/store/index.js'

export const xhrClient = axios.create()

export const apiClient = axios.create({
  baseURL: '/api/v1',
})

apiClient.defaults.timeout = 5000

apiClient.interceptors.request.use(async function addAuthHeader (config) {
  if (config.url === '/auth' || config.url.startsWith('/version')) {
    return config
  }

  const token = await localforage.getItem('app-token')

  if (token) {
    Object.assign(config.headers, {
      Authorization: `Bearer ${token}`,
    })
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

apiClient.interceptors.response.use(
  response => {
    const isSuccess = response?.data?.success
    if (!isSuccess) {
      const message = response?.data?.message || 'Oups ! Une erreur inconnue est survenue…'
      const messages = response?.data?.messages
      const error = new Error(message)
      error.messages = messages
      return Promise.reject(error)
    }
    return Promise.resolve(response)
  },
  error => {
    const response = error?.response
    const isUnauthorized = response?.status === 401
    if (error?.code === 400) {
      const customError = new Error(response.data.message)
      customError.statusCode = 400
      return Promise.reject(customError)
    }
    if (isUnauthorized) {
      store.dispatch('logout')
      const customError = new Error('Authentification incorrecte, vous devez vous reconnecter')
      customError.statusCode = 401
      return Promise.reject(customError)
    }
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('Network Error')) {
      store.dispatch('noConnectionAvailable')
      const customError = new Error('Communication impossible avec le serveur')
      return Promise.reject(customError)
    }
    const apiError = new Error(response?.data?.message || response?.statusText || error?.message)
    apiError.statusCode = response?.status
    return Promise.reject(apiError)
  },
)
