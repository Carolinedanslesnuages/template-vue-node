/**
 * Gestion des utilisateurs
 *
 * @module
 */

import User from './user-model.js'
import { v4 as uuidv4 } from 'uuid'
import { compareToHash } from '../util/crypto.js'
import { techLogger } from '../util/logger.js'

export const INVALID_CREDENTIALS = 'emails invalides'

/**
 * Créer un nouvel utilisateur
 *
 * @param {import('./user-model').UserData} userData - Les données de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const createUser = async (userData) => {
  console.log(userData)
  const user = new User(userData)
  user.emailValidationHash = uuidv4()
  await user.save()
  return user
}

/**
 * Recherche tous les utilisateurs
 *
 *@returns  {Promise.<[import('./user-model').UserMongooseDocument]>} - Liste de documents de l'utilisateur
 */
export const getAllUsers = () => User.find({})

/**
 * Recherche un utilisateur par son ID
 *
 * @param {string} id - ID mongo de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const getUserById = (id) => User.findById(id)

/**
 * Recherche un utilisateur par son ID
 *
 * @param {string[]} id - Liste d'ID mongo d'utilisateurs
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument[]>} - Document de l'utilisateur
 */
export const getUsersById = (ids) => User.find().where('_id').in(ids)

/**
 * Recherche un utilisateur par son adresse courriel
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const getUserByEmail = (email) => User.findOne({ email })

/**
 * Recherche un utilisateur par son email
 *
 * @param {string} email - email de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const getUserByemail = (email) => User.findOne({ email })

/**
 * Recherche plusieurs utilisateurs par leurs emails
 *
 * @param {string} email - email de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument[]>} - Liste de document de l'utilisateur
 */
export const getUsersByemailMatching = async (email) => {
  const user = await User.find({
    email: {
      $regex: new RegExp(`.*${email}.*`),
    },
  }).limit(10).sort({ email: 1 })
  return user
}

/**
 * Recherche plusieurs utilisateurs par leurs firstname, lastname ou email
 *
 * @param {string} email - email de l'utilisateur
 * @param {string} firstname - Firstname de l'utilisateur
 * @param {string} lastname - Lastname de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument[]>} - Liste de document de l'utilisateur
 */
export const findUsersByMatching = async (search) => {
  return User.aggregate([
    {
      $addFields: {
        fullname: {
          $concat: [
            '$firstname',
            ' ',
            '$lastname',
          ],
        },
        fullnameReverse: {
          $concat: [
            '$lastname',
            ' ',
            '$firstname',
          ],
        },
      },
    },
    {
      $match: {
        $or: [
          {
            email: {
              $regex: search,
              $options: 'i',
            },
          },
          {
            fullname: {
              $regex: search,
              $options: 'i',
            },
          },
          {
            fullnameReverse: {
              $regex: search,
              $options: 'i',
            },
          },
        ],
      },
    },
  ])
    .sort({ email: 1 })
}

/**
 * Recherche un utilisateur avec les emails passés en arguments
 *
 * @param {string} email - email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const findUserByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  const error = new Error(INVALID_CREDENTIALS)
  error.code = INVALID_CREDENTIALS
  if (!user) {
    techLogger.info({ UseEmail: email })
    throw error
  }

  const isMatch = await compareToHash(password, user.password)
  if (!isMatch) {
    throw error
  }

  return user
}

/**
 * Recherche un utilisateur par son adresse courriel
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur
 */
export const findUserbyEmail = async (email) => {
  const user = await User.findOne({ email })
  return user
}

/**
 * Modifie les propriétés d'un utilisateur
 *
 * @param {string} id - ID de l'utilisateur
 * @param {import('./user-model.js').UserData)} dataToUpdate - ID de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur modifié
 */
export const updateUserById = async (id, dataToUpdate) =>
  User.findByIdAndUpdate(id, dataToUpdate, { new: true })

/**
 * Retourne un email contenant un lien avec un hash
 * @async
 * @function
 *
 * @param {string} email - L'adresse courriel de l'utilisateur
 *
 * @returns {Promise.<string>} - Hash de validation de l'email
 */
export const addEmailValidationHash = async email => {
  const emailValidationHash = uuidv4()
  const user = await getUserByEmail(email)
  user.emailValidationHash = emailValidationHash
  user.passwordResetRequestedAt = new Date()
  await user.save()
  return emailValidationHash
}

/**
 * Remplace le mot de passe existant de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {User} user - Le document user de l'utilisateur à modifier
 * @param {string} password - Le nouveau mot de passe de l'utilisateur
 *
 * @returns {Promise.<User>} - Le document utilisateur modifié
 */
export const updateUserPassword = async (user, password) => {
  const now = Date.now()
  const passwordResetRequestedAt = user.passwordResetRequestedAt
  const difference = now - passwordResetRequestedAt
  const fifteenMinutes = 15 * 60 * 1000
  if (difference > fifteenMinutes) {
    const error = new Error(
      'Votre lien a expiré, veuillez refaire votre demande de réinitialisation de mot de passe',
    )
    error.status = 401
    throw error
  }
  user.password = password
  await user.save()
  return user
}
/**
 * Supprime un utilisateur à partir de son adresse courriel
 * ⚠ À n'utiliser que pour les tests ou pour init-db.js
 *
 * @param {string} email - Adresse courriel de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur modifié
 */
export const _deleteUserByEmail = async (email) => {
  const user = await getUserByEmail(email)
  await User.findByIdAndDelete(user.id)
  return user
}

/**
 * Supprime un utilisateur
 * ⚠ À n'utiliser que pour les tests ou pour init-db.js
 *
 * @param {string} id - ID de l'utilisateur
 *
 * @returns {Promise.<import('./user-model').UserMongooseDocument>} - Document de l'utilisateur modifié
 */
export const _deleteUserById = async (id) => {
  const user = await getUserById(id)
  await User.findByIdAndDelete(user.id)
  return user
}
