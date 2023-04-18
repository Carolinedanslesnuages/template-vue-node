
import { appLogger, techLogger } from '../../util/logger.js'
import { checkToken } from '../../util/token.js'

const send401 = res => {
  res.status(401)
    .json({ success: false, message: 'Accès non autorisé' })
}

/**
 * @function
 *
 * @param {import('express').Request} req - La requête express
 * @param {import('express').Response} res - La réponse express
 * @param {import('express').NextFunction} res - La fonction `next()` express
 */

export function verifyToken (req, res, next) {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.replace('Bearer ', '')
  const loggerInfo = {
    section: 'verify-token',
    token,
  }

  if (!token) {
    techLogger.error(loggerInfo)
    send401(res)
    return
  }

  try {
    const { id, profile, roles } = checkToken(token)

    req.userId = id
    req.userProfile = profile
    req.userRoles = roles
    techLogger.info(loggerInfo)
    next()
  } catch (error) {
    appLogger.warn(`Attempt to reach ${req.path} without token`)
    send401(res)
  }
}
