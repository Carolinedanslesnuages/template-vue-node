import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config()

const defaultPublicUrl = 'http://localhost:8080'
const isCI = process.env.CI === 'true'

const publicUrl = isCI
  ? defaultPublicUrl
  : process.env.PUBLIC_URL || defaultPublicUrl


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
  srcPath: resolve('./src'),

}
