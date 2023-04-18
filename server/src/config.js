import dotenv from 'dotenv'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const publicUrl = process.env.PUBLIC_URL || 'http://localhost:8080'

const userRole = {
  GESTIONNAIRE: 'GESTIONNAIRE',
  SUPERADMIN: 'SUPERADMIN',
}

const permissions = {
  GESTION: 'gestion',
  // STATS: 'statistique',
}

const userRoleAccess = {
  [userRole.GESTIONNAIRE]: [
    permissions.GESTION,
    // permissions.STATS
  ],
  [userRole.SUPERADMIN]: [
    permissions.GESTION,
    // permissions.STATS
  ],
}

export default {
  tokenExpiration: '3h',
  secret: process.env.TOKEN_SECRET || 'secret',
  publicUrl,
  userRole,
  userRoleAccess,
  permissions,
  srcPath: fileURLToPath(dirname(import.meta.url)),
}
