import createUser from './create-user-account.js'

export default async () => {
  return Promise.all([
    createUser(),
  ])
}
