import { createUser } from '../src/models/user-queries.js'

import { techLogger } from '../src/util/logger.js'

import users from './users.json' assert {type: "json"}

techLogger.info('Creating users')

export default async () => {
  const usersCreated = users.map(user =>
    createUser(user)
      .then(() => {
        techLogger.info(`Compte ${user.email} créé !`)
      })
      .catch(error => techLogger.error(error)))
  return Promise.all(usersCreated)
}
