/* eslint-disable-next-line no-useless-escape */
export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@mainbot.me$/

export const strongEnoughPasswordObject = {
  '8 caractères': /^.{8,}$/,
  '1 chiffre': /\d+/,
  '1 majuscule': /[A-Z]+/,
  '1 minuscule': /[a-z]+/,
  '1 caractère spécial': /\W+/,
}

export const stripHtmlRegex = /<\/?[^>]+(>|$)/g

export const strongPassword = Object.values(strongEnoughPasswordObject)

export const validateEmail = mat => email.test(mat)

export const validatePassword = pwd => strongPassword.every(passwdRegex => passwdRegex.test(pwd))
