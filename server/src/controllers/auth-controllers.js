import { createToken, checkToken } from '../util/token.js'
import {
  findUserByCredentials,
  getUserById,
} from '../models/user-queries.js'
import { appLogger, techLogger } from '../util/logger.js'
import { limiterConsecutiveFailsByEmail } from '../util/brute-force-util.js'

/**
 * Crée un JWT si les emails sont corrects
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.body.email - email de l'agent (utilisateur)
 * @param {string} req.body.password - Mot de passe de l'agent (utilisateur)
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  const { email, password } = req.body

  const loggerInfo = {
    section: 'auth-controller',
    action: 'login',
  }

  appLogger.info({
    ...loggerInfo,
  })
  try {
    const user = await findUserByCredentials(email, password)
    appLogger.info({
      ...loggerInfo,
      userConnected: user.id,
    })
    if (!user.isValidatedEmail) {
      techLogger.warn(`User ${user.id} tried to login with not yet validated email`)
      res.status(401).json({
        success: false,
        message: "Vous n'avez pas encore validé votre adresse courriel",
      })
      return
    }
    // ràz du nombre d'essais de connexion pour un email lors du login (bruteforce)
    await limiterConsecutiveFailsByEmail.delete(user.email).catch((error) => {
      techLogger.warn({
        section: 'login',
        subject: user.email,
        message: 'Could not reset consecutive fails',
        error,
      })
    })
    const token = createToken({ id: user._id, profile: user.profile, roles: user.roles })
    appLogger.info({
      ...loggerInfo,
      description: 'createToken',
      token,
    })
    res.status(201).json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    techLogger.error({
      ...loggerInfo,
      message: error.message,
    })
    res.status(500).json({
      message: error.message,
      success: false,
    })
  }
}

/**
 * Vérifie la validité d'un JWT
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.query.token - Token à vérifier
 * @param {import('express').Response} res
 */
export async function verifyToken (req, res) {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.replace('Bearer ', '')
  let userId

  const loggerInfo = {
    section: 'auth-controller',
    action: 'verify-token',
  }
  try {
    const payload = checkToken(token)
    userId = payload.id
    appLogger.info({ ...loggerInfo, currentUser: userId })
  } catch (error) {
    techLogger.info({ ...loggerInfo, message: error.message })
    res.status(401).json({
      success: false,
      message: 'Votre jeton de connexion est invalide, veuillez vous reconnecter',
    })
    return
  }

  try {
    techLogger.debug(`userId: ${userId}`)
    const user = await getUserById(userId)
    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    techLogger.error({ loggerInfo, message: error.message })
    res.status(401).json({
      success: false,
      message: 'Impossible de récupérer vos données de profil',
    })
  }
}
