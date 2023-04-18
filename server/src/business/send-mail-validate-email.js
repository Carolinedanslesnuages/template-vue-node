import config from '../config.js'
import { sendMail } from '../util/mail/send-mail.js'
import { getHtmlBody } from '../util/mail/template-mail.js'
import { techLogger } from '../util/logger.js'

/**
 * Envoie un courriel à l'utilisateur qui vient de créer son compte avec un lien pour valider
 * son adresse courriel
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel du destinataire
 * @param {string} emailValidationHash - Hash de validation de l'adresse courriel de l'utilisateur
 *
 * @returns {Promise.<import('nodemailer').SentMessageInfo>} - Info d'envoi du mail
 */
export const sendMailValidateEmail = (id, email, emailValidationHash) => {
  const mailInfo = getValidateEmailMailInfo(id, email, emailValidationHash)
  try {
    return sendMail(email, mailInfo)
  } catch (error) {
    techLogger(`Erreur lors de la tentative d'envoi du courriel à ${email}`)
    throw error
  }
}

/**
 * Calcule un lien de validation d'adresse courriel
 *
 * @param {string} email - Adresse courriel
 * @param {string} emailValidationHash - Hash de validation de l'adresse courriel de l'utilisateur
 *
 * @returns {string} - URL à atteindre pour valider l'adresse courriel de l'utilisateur
 */

export const computeValidateEmailLink = (_id, emailValidationHash) => {
  const urlValidationEmail = `<a href="${config.publicUrl}/utilisateurs/validation-email?id=${encodeURIComponent(_id)}&h=${emailValidationHash}" rel="notrack">lien de validation</a>`

  return urlValidationEmail
}

/**
 * Retourne le contenu du corps du courriel pour une validation d'adresse courriel
 * @function
 *
 * @param {string} link - Lien de validation de l'adresse courriel
 *
 * @returns {string} - Corps du courriel
 */

export const getValidateEmailMailTemplate = (link) => `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
tempor incididunt ut labore et dolore magna aliqua. ${link} 
</p>

`

/**
 * Construit le corps du mail à envoyer pour la validation de l'adresse courriel d'un nouvel utilisateur
 * @function
 *
 * @param {string} email - Adresse courriel du destinataire
 * @param {string} emailValidationHash - Hash de validation de l'adresse courriel de l'utilisateur
 *
 * @returns {string} - Corps du courriel
 */
export const getValidateEmailMailBody = (_id, emailValidationHash) => {
  const link = computeValidateEmailLink(_id, emailValidationHash)
  const content = getValidateEmailMailTemplate(link)
  return getHtmlBody(content)
}

/**
 * Récupère les infos du mail à envoyer pour une validation de l'adresse courriel
 *
 * @function
 *
 * @param {string} email - Adresse courriel du destinataire
 * @param {string} emailValidationHash - Hash de validation de l'adresse courriel de l'utilisateur
 *
 * @returns {MailContent}
 */
export const getValidateEmailMailInfo = (id, email, emailValidationHash) => {
  const subject = 'APP - Validez votre adresse courriel'
  const body = getValidateEmailMailBody(id, emailValidationHash)
  return { subject, body, to: email }
}

/**
 * @typedef MailContent
 * @type {Object}
 *
 * @property {string} subject - Sujet du courriel
 * @property {string} to - Destinataire du courriel
 * @property {string} body - Corps (en HTML) du courriel
 */
