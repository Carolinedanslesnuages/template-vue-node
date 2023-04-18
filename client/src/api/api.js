import { apiClient } from './xhr-client.js'


/**
 * Sauvegarde un utilisateur en base de données
 *
 * @async
 * @function
 *
 * @param {User} user - Données de l'utilisateur
 *
 * @returns {Promise.<UsersResponse>}} - L'utilisateur sauvegardé
 */
export async function saveUser (user) {
  let route = '/users'
  let method = 'post'
  if (user.createdAt) {
    delete user.password
    delete user.email
    method = 'patch'
    route += `/${user._id}`
  }
  const response = await apiClient[method](route, user)
  console.log(response)
  return response.data
}

/**
 * Met à jour un utilisateur par le gestionnaire en base de données
 *
 * @async
 * @function
 *
 * @param {User} user - Données de l'utilisateur
 *
 * @returns {Promise.<UsersResponse>}} - L'utilisateur sauvegardé
 */
export async function updateUserByGestionnaire (user) {
  const response = await apiClient.patch(`/users/gestion/${user._id}`, user)
  return response.data
}

/**
 * Récupère  les utilisateurs
 *
 * @async
 * @function
 *
 *
 */
export async function getUsers () {
  const response = await apiClient.get('/users')
  return response.data.users
}
/**
 * Récupère  un utilisateur par son ID depuis la base de données
 *
 * @async
 * @function
 *
 * @param {string} userId - ID de l'utilisateur
 *
 * @returns {Promise.<UserData>}} - L'utilisateur
 */
export async function getUserById (userId) {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data.user
}

/**
 * Récupère les utilisateurs à partir du email, du prénom ou du nom
 *
 * @async
 * @function
 *
 * @param {string} search - chaine de caractère envoyée
 *
 * @returns {Promise.<UserData>[]}} - Les utlisateurs dont le email, le prénom ou le nom contient la
 * chaine email envoyée
 */
export async function getUsersByMatching (search) {
  const response = await apiClient.get(`/users?matching=${search || ''}`)
  return response.data.users
}

/**
 * Récupère  un token utilisateur à partir de son email et mot de passe
 *
 * @async
 * @function
 *
 * @param {string} email - email utilisateur
 * @param {string} password - password utilisateur
 *
 * @returns {Promise.<Object>}} - Objet avec success à `true`, le token dans la propriété token et l'utilisateur dans la propriété user,
 *                               ou avec success à `false`  et le message correspondant dans la propriété `message` en cas d'echec
 */
export async function requestToken (email, password) {
  const data = { email, password }
  const response = await apiClient.post('/auth', data)
  return response.data
}

/**
 * Récupère  un utilisateur à partir de son token
 *
 * @async
 * @function
 *
 * @param {string} token - token de l'utilisateur
 *
 * @returns {Promise.<Objet>}} - Objet avec success à `true` et l'utilisateur dans la propriété user,
 *                               ou avec success à `false`  et le message correspondant dans la propriété `message` en cas d'echec
 */
export async function verifyToken (token) {
  const data = { token }
  const response = await apiClient.get('/auth/verify-token', data)
  return response.data
}

/**
 * Envoie une adresse courriel pour envoyer un courriel permettant au destinataire de
 * réinitialiser son mot de passe
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 *
 * @returns {Promise.<Object>} - Objet avec success à `true` si le mail a pu être envoyé,
 *                               à `false` sinon, avec le message correspondant
 *                               dans la propriété `message`
 */
export async function sendMailResetLink (email) {
  const response = await apiClient.post('/users/reset-link', { email })
  return response.data
}

/**
 * Envoie le nouveau mot de passe de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 *
 * @returns {Promise.<Object>} - Objet avec success à `true` si le mail a pu être envoyé,
 *                               à `false` sinon, avec le message correspondant
 *                               dans la propriété `message`
 */
export async function resetPassword (email, hash, password) {
  const response = await apiClient.patch('/me', { email, hash, password })
  return response.data
}


export async function validateEmail (id, emailValidationHash) {
  const response = await apiClient.patch(`/users/${id}`, { h: emailValidationHash })
  return response.data
}


/**
 * @typedef UsersResponse
 * @type {Object}
 *
 * @property {string=} message - Message à afficher à l'utilisateur (surtout en cas d'erreur)
 * @property {boolean} success - Succès (`true`) ou non (`false`) de la requête
 */

/**
 * @typedef UserData
 * @type {Object}
 *
 * @property {string} _id - ID de l'utilisateur
 * @property {Date} createdAt - Date de création du document danb bdd
 * @property {Date} updatedAt - Date de dernière modification daba bdd
 * @property {string} email - Adresse courriel de l'utilisateur
 * @property {string} emailValidationHash - Hash de validation de l'email de l'utilisateur
 * @property {string} emailValidatedAt - Date de validation du courrier de l'utilisateur
 * @property {string} isValidatedEmail - Valeur à (false) si l'email n'est pas valide
 */
