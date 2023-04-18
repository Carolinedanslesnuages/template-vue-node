import { closeConnections, getConnection } from '../connect.js'
import { validateEmail } from './validate-email.js'
import { createUser, updateUserById } from '../models/user-queries.js'

import { createRandomValidUser } from '../models/__tests__/user-util.js'
import { sendMailValidatedEmail } from './send-mail-validated.js'
import { vi } from 'vitest'

vi.mock('./send-mail-validated.js')

describe('validateEmail', () => {
  let mongodbMemServer

  beforeAll(async () => {
    mongodbMemServer = await getConnection()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })

  it('Should send a confirmation email and return an object with updatedUser', async () => {
    // Given
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)
    const hash = 'test-hash'
    user.emailValidationHash = hash
    await updateUserById(user._id, user)

    // When
    const result = await validateEmail(user._id, hash)

    // Then
    expect(result).toBeInstanceOf(Object)
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('updatedUser')
    expect(sendMailValidatedEmail).toHaveBeenCalled()
    expect(sendMailValidatedEmail).toHaveBeenCalledTimes(1)
    expect(sendMailValidatedEmail.mock.calls[0][0]).toBe(user.email)
  })
  it('Should send a 404 because email hash is invalide', async () => {
    // Given
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)
    const hash = 'test-hash'
    await updateUserById(user._id, user)

    // When
    const result = await validateEmail(user._id, hash)

    // Then
    expect(result).toBeInstanceOf(Object)
    expect(result).toHaveProperty('success', false)
    expect(result).toHaveProperty('message', "Votre lien n'est pas valide")
  })
})
