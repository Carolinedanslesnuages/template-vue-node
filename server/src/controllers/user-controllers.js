/**
 * Controleur permettant de récuperer les informations des utilisateurs
 *
 * @module
 *
 */

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateUserPassword,
  findUsersByMatching,
} from '../models/user-queries.js'
import { WEAK_PASSWORD } from '../models/messages.js'

import { appLogger, techLogger } from '../util/logger.js'
import { limiterConsecutiveFailsByEmail } from '../util/brute-force-util.js'
import { validateEmail } from '../business/validate-email.js'
import { sendMailValidateEmail } from '../business/send-mail-validate-email.js'
import { sendMailConfirmationPassword } from '../business/send-mail-confirmation-new-password.js'
import { sendMailResetLink } from '../business/send-mail-reset-password.js'
import { send403, send409 } from '../util/response.js'
import { userKeys } from './util-controllers/util-user.js'

/**
 * Valide l'adresse courriel de l'utilisateur
 *
 * @param {import('express').Request} req - Requête express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.email - Adresse couriel de l'utisateur recherché
 * @param {Object} req.query - Représentation d'un objet de la QS de la requête
 * @param {string} req.query.h - Hash de l'utisateur recherché
 * @param {import('express').Response} res - Réponse express
 */

export const getProperObjectFromError = error => {
  if (error == null) {
    return '<empty error>'
  }
  return Object.getOwnPropertyNames(error).reduce(
    (acc, key) => ({
      ...acc,
      [key]: error[key],
    }),
    Object.create(null),
  )
}

/**
 * Crée un utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req._id - Id de l'utilisateur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur
 * @param {string} req.body.emailValidationHash - Hash de validation de l'email de l'utilisateur
 * @param {string} req.body.emailValidatedAt - Date de validation du courrier de l'utilisateur
 * @param {string} req.body.isValidatedEmail - Valeur à (false) si l'email n'est pas valide
 *
 * @param {import('express').Response} res
 */
export const createUserController = async (req, res) => {
  const userDataRequest = {}

  for (const key of userKeys) {
    userDataRequest[key] = req.body[key]
  }

  const loggerInfo = {
    section: 'create-user-controller',
    action: 'created-User',
    description: "création d'un utilisateur",
  }


  if (!userDataRequest.email) {
    res.status(400).json({
      success: false,
      message: 'Oups ! L\'email est obligatoire',
    })
    return
  }


  if (userDataRequest.password !== userDataRequest.confirmPassword) {
    res.status(400).json({
      success: false,
      message: 'Oups ! Les mots de passe ne correspondent pas',
    })
    return
  }

  delete userDataRequest.confirmPassword

  let savedUser

  try {
    savedUser = await createUser(userDataRequest)
    appLogger.info({
      ...loggerInfo,
      savedUser: savedUser.id,
      action: 'created-user',
      description:
        "L'utilisateur a bien été créé et un courriel lui a été envoyé",
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: `Impossible de créer l'utilisateur·ice : ${error.message}`,
      error,
    })
    const errors = error.errors ? Object.entries(getProperObjectFromError(error.errors)) : undefined
    if (errors) {
      appLogger.warn(`Erreur: ${Object.entries(getProperObjectFromError(error.errors))}`)
      for (const err of Object.entries(getProperObjectFromError(error.errors))) {
        appLogger.warn(`Erreur: ${err.message}`)
      }
      const message =
        errors.length === 1
          ? errors[0][1].message
          : errors.length === 0
            ? 'Erreur inattendue'
            : 'Plusieurs erreurs ont été détectées :'
      const messages = errors.map(([key, fieldError]) =>
        `${fieldError.message} (${
          fieldError.value == null
            ? 'non renseigné'
            : fieldError.value
        })`,
      )
      res.status(400).json({
        message,
        ...(errors.length > 1
          ? { messages }
          : {}),
        success: false,
      })
      return
    }

    appLogger.warn(error.message)

    const status =
      error.message === WEAK_PASSWORD || error.message.includes('E11000')
        ? 400
        : 500
    res.status(status).json({
      message: error.message,
      success: false,
    })
    return
  }

  try {
    appLogger.info({
      ...loggerInfo,
      user: savedUser.id,
      action: 'created-user',
      description:
        "Tentative d'envoi de courriel..",
    })
    const response = await sendMailValidateEmail(savedUser.id, savedUser.email, savedUser.emailValidationHash)
    appLogger.info({
      ...loggerInfo,
      user: savedUser.id,
      action: 'created-user',
      description:
        'Courriel envoyé',
    })

    res.status(201).json({
      message: `Un courriel a été envoyé à ${savedUser.email}, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables)`,
      response,
      success: true,
      user: savedUser,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      user: savedUser.id,
      description: `Impossible d'envoyer un email : ${error.message}`,
      error,
    })
    techLogger.error(error.message)
    res.status(500).json({
      success: false,
      message:
        "Oups ! Une erreur est survenue lors de l'envoi du courriel de validation de votre adresse courriel.",
    })
  }
}

/**
 * Récupère les utilisateurs, et un utilisateur soit par son email ou plusieurs utilisateurs par une partie de leur email
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req - Requête express
 * @param {string} req.body.email - email de l'utilisateur recherché
 * @param {string[]} req.body.users - Tout les utilisateurs
 * @param {import('express').Response} res - Réponse express
 */
export const getUsersController = async (req, res) => {
  const { userId, userRoles, profile } = req
  const { matching } = req.query
  const loggerInfo = {
    section: 'get-users-Controller',
    action: 'get-user',
    user: userId,
    role: userRoles,
    profile,
  }
  if (matching) {
    appLogger.info({
      ...loggerInfo,
      action: 'get-users-matching',
    })
    const users = await findUsersByMatching(matching)
    res.status(200).json({
      users,
      success: true,
    })
    return
  }

  try {
    const allUsers = await getAllUsers()
    appLogger.info({
      ...loggerInfo,
      action: 'get-all-users',
    })
    res.status(200).json({
      users: allUsers,
      success: true,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'get-all-users',
      description: `Impossible de récupérer les utilisateurs : ${error.message}`,
      error,
    })
    techLogger.error(error.message)
    res.status(500).json({
      message: error.message,
      success: false,
    })
  }
}

/**
 * Recherche un utilisateur par son Id
 *
 * @param {import('express').Request} req - Id de l'utisateur recherché
 * @param {string} req._id - Id de l'utisateur recherché
 * @param {import('express').Response} res
 */
export const getUserByIdController = async (req, res) => {
  const userId = req.params.id
  const user = await getUserById(userId)
  const loggerInfo = {
    section: 'get-user-by-id-Controller',
    action: 'get-user-by-id',
    user: userId,

  }
  try {
    appLogger.info({
      ...loggerInfo,
    })

    if (user === null) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur·ice absent de la base de données',
      })
      return
    }
    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: `Impossible de récupérer l' utilisateur : ${error.message}`,
      error,
    })
    techLogger.error(error.messa)
    res.json({
      message: error.message,
      success: false,
    })
  }
}

/**
 * Envoie un courriel avec un lien de réinitialisation de mot de passe pour l'utilisateur
 * dont l'adresse courriel est dans le corps de la requête
 *
 * @async
 * @function
 *
 * @param {import('express').Request } req -Requête express
 * @param {string} req.body.email - Adresse courriel de l'utilisateur
 */
export const sendResetLinkController = async (req, res) => {
  const email = req.body.email
  let user

  const loggerInfo = {
    section: 'send-Reset-Link-Controller',
    action: 'reset-link',
  }

  try {
    user = await getUserByEmail(email)
    if (!user) {
      throw new Error('Failed to find user')
    }
  } catch (error) {
    appLogger.warn({
      ...loggerInfo,
      action: 'FAILED_TO_FIND_USER_BY_EMAIL',
      description: `User with email ${email} tried to reset password but email does not existerror.message : ${error.message}`,
      error,
    })
    res.status(400)
      .json({
        success: false,
        message: 'Une erreur est survenue',
      })
    return
  }

  if (!user.isValidatedEmail || user.emailValidatedAt == null) {
    try {
      await sendMailValidateEmail(user.id, user.email, user.emailValidationHash)
      appLogger.warn({
        ...loggerInfo,
        section: 'Send-mail',
        description: `User with email ${email} tried to reset password but email is not yet validated`,
      })
    } catch (error) {
      appLogger.error({
        section: 'Send-mail-validate-email',
        action: 'Send-mail',
        description: `Impossible d'envoyer le lien de validation à ${email}`,
      })
      appLogger.error(error.message)
    }
    res.status(400)
      .json({
        success: false,
        message: "Votre adresse courriel n'a pas encore été validée. Un nouveau mail de validation vous a été envoyé",
      })
    return
  }

  try {
    await sendMailResetLink(email)
    appLogger.info({
      ...loggerInfo,
      action: 'send-mail-reset-link',
      description: `un lien de réinitialisation à été envoyé à ${email}`,
    })
  } catch (error) {
    appLogger.error({
      section: 'Send-mail-reset-link',
      action: 'Send-mail',
      description: `Impossible d'envoyer le courriel de réinitialisation à ${email}`,
    })
  }

  return res.status(201).json({
    success: true,
    message: `Si votre adresse courriel ${email} correspond bien à un utilisateur, vous allez recevoir un courriel prochainement`,
  })
}

/**
 * Met à jour le mot de passe de l'utilisateur avec
 * le mot de passe donné dans le corps de la requête
 *
 * @param {import('express').Request } req -Requête express
 * @param {string} req.body.password - Nouveau mot de passe de l'utilisateur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur
 * @param {string} req.body.hash - Hash de l'utilisateur
 */
export const resetPasswordController = async (req, res) => {
  const { password, email, hash } = req.body

  const user = await getUserByEmail(email)

  const loggerInfo = {
    section: 'reset-PasswordController',
    action: 'reset-password',
  }

  if (!user) {
    appLogger.warn({
      ...loggerInfo,
      action: 'FAILED_TO_FIND_USER_BY_EMAIL',
      description: `${email} not in DB`,
    })

    return res.status(404).json({
      success: false,
      message: "Votre adresse courriel n'est pas reconnu.",
    })
  }

  if (user.emailValidationHash !== hash) {
    return res.status(401).json({
      success: false,
      message:
        "Votre lien est invalide. Pour rappel, il n'est valable que durant quinze minutes; Veuillez redemander un lien de réinitialisation de mot de passe",
    })
  }

  try {
    updateUserPassword(user, password)
    await limiterConsecutiveFailsByEmail.delete(user.email).catch((error) => {
      techLogger.warn({
        section: 'update-password',
        subject: user.email,
        message: 'Could not reset consecutive fails',
        error,
      })
    })
  } catch (error) {
    appLogger.error({
      section: 'Update-password',
      action: 'Update',
      description: `Impossible de modifier le mot de passe' ${error.message}`,
      error,
    })
    return res.status(500).json({
      success: false,
      message: error.status
        ? error.message
        : 'Une erreur est survenue lors de la modification de votre mot de passe',
    })
  }

  try {
    await sendMailConfirmationPassword(email)
    res.status(200).json({
      success: true,
      message: `Un courriel de confirmation vient de vous être envoyé sur ${email}`,
    })
  } catch (error) {
    appLogger.error({
      section: 'Send-mail-reset-confirmation',
      action: 'Send-mail',
      description: `Impossible d'envoyer l'email de confirmation de changement de mot de passe à ${email}`,
    })
    res.status(500).json({
      success: false,
      message:
        "Votre mot de passe a bien été changé, mais une erreur est survenue lors de l'envoi du courriel de confirmation..",
    })
  }
}

/**
 * Met à jour l'utilisateur
 *
 * @param {import('express').Request } req -Requête express
 * @param {string} req._id - Id de l'utilisateur
 * @param {string} req.body.email - email de l'utilisateur
 */

export const updateUserController = async (req, res) => {
  const { userId } = req
  const userDBData = await getUserById(req.params.id)
  const userKeysToModify = userKeys.filter(key =>
    !key.includes('assword') &&
    !key.includes('mail'))
  const userDataRequest = {}

  for (const key of userKeysToModify) {
    userDataRequest[key] = req.body[key]
  }

  const loggerInfo = {
    section: 'update-controller',
    action: 'update-user',
    currentUser: userId,
    user: userDBData?.id,
  }
  appLogger.info({
    loggerInfo,
  })

  try {

    const updatedUser = await updateUserById(userDBData.id, userDataRequest)

    appLogger.info({
      loggerInfo,
      user: updatedUser,
    })
    res.status(200).json({
      message: 'Le profil a été modifié',
      success: true,
      user: updatedUser,
    })
    return
  } catch (error) {
    appLogger.error({ error })
    techLogger.error({ error })
    if (error.code === 403) {
      return send403(res, error.message)
    }
    send409(res, 'Une erreur s\'est produite.')
  }
}

export const validateUserMailController = async (req, res) => {
  const id = req.params.id

  const hash = req.body.h

  const loggerInfo = {
    section: 'validate-User-mail-Controller',
    action: 'validate-mail',
    id,
    hash,
  }

  try {
    const user = await getUserById(id)

    if (!user) {
      appLogger.warn({
        ...loggerInfo,
        action: 'FAILED_TO_FIND_USER_BY_EMAIL',
        description: `${user.id} not in DB`,
      })
      res.status(404).json({
        success: false,
        message: 'Utilisateur·ice absent de la base de données',
      })
      return
    }

    const { isValidatedEmail } = user

    if (isValidatedEmail) {
      appLogger.warn({
        ...loggerInfo,
        description: `L'adresse courriel ${user.email} est déjà validée`,
      })
      res.status(200).json({
        success: true,
        message: 'Votre adresse courriel est déjà validée',
      })
      return
    }
    const emailValidationResult = await validateEmail(user.id, hash)

    res
      .status(emailValidationResult.success ? 200 : 401)
      .json(emailValidationResult)
  } catch (error) {
    appLogger.error({
      section: 'Send-validated-mail',
      action: 'Send-mail',
      description: `Impossible d'envoyer le mail de validation ${error.message}`,
    })
    res.status(500).json({
      success: false,
      message:
        "Oups, un problème est survenu, impossible de valider votre adresse courriel.",
    })
  }
}

/**
 * @typedef {Object} User
 *
 * @property {string} email - Adresse courriel de l'utilisateur
 */
