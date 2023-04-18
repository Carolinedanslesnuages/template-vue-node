import jwt from 'jsonwebtoken'
import config from '../config.js'

export const options = {
  expiresIn: config.tokenExpiration,
}

export function createToken (payload) {
  const secret = config.secret

  const token = jwt.sign(payload, secret, options)

  return token
}

export function checkToken (token) {
  const secret = config.secret
  return jwt.verify(token, secret)
}
