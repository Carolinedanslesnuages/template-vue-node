
import config from '../../config.js'

import { getUserById } from '../../models/user-queries.js'
import { appLogger } from '../../util/logger.js'
import { send401, send404 } from '../../util/response.js'

export async function verifyAccess (req, res, next) {
  const { userRoles, userId } = req

  const userToUpdate = await getUserById(req.params.id)

  const unexistingUser = "L'utilisateur n'existe pas"
  const accessForbidden = 'Accès non autorisé. Veuillez contactez l\'administrateur.'

  const loggerInfo = {
    section: 'gestion-middleware',
    action: 'check-access',
    roles: userRoles,
    userId,
    userToUpdate: userToUpdate?.id,

  }

  if (!userToUpdate) {
    appLogger.info({
      loggerInfo,
    })
    send404(res, unexistingUser)
    return
  }

  try {
    appLogger.info({
      ...loggerInfo,
    })
    if (userId === userToUpdate?.id || userRoles.includes(config.userRole.GESTIONNAIRE)) {
      next()
    }
  } catch (error) {
    appLogger.info({
      ...loggerInfo,
      message: `Accès non autorisé. ${userId}  ne peux pas modifier ${userToUpdate?.id}`,
    })
    send401(res, accessForbidden)
  }
}
