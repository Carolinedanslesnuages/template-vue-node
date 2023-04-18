import { getConnection, closeConnections } from '../connect.js'
import { createRandomValidUser, createRandomUserWithInvalidEmail } from './__tests__/index.js'

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByemail,
  getUsersByemailMatching,
  findUserByCredentials,
  updateUserById,
  getUsersById,
} from './user-queries.js'
import { NOT_ALLOWED_EMAIL_MESSAGE } from './messages.js'
import { repeatFn } from '../__tests__/fp-util.js'

describe('User queries', () => {
  let mongodbMemServer
  beforeAll(async () => {
    mongodbMemServer = await getConnection()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })

  it('Should save a user', async () => {
    // Given
    const leanUser = createRandomValidUser()
    // When
    const user = await createUser(leanUser)

    // Then
    expect(user).toBeDefined()
    expect(user.isNew).toBe(false)
    expect(user.firstname).toBe(leanUser.firstname)
    expect(user.lastname).toBe(leanUser.lastname)
  })

  it('Should not save a user with invalid email', async () => {
    // Given
    const leanUser = createRandomUserWithInvalidEmail()
    // When
    const error = await createUser(leanUser).catch(error => error)

    // Then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('errors')
    expect(error.errors).toBeInstanceOf(Object)
    expect(error.errors).toHaveProperty('email')
    expect(error.errors.email).toBeInstanceOf(Error)
    expect(error.errors.email.message).toBe(NOT_ALLOWED_EMAIL_MESSAGE)
  })

  it('Should not save a user with existing email', async () => {
    // Given
    const leanUser = createRandomValidUser()
    const userWithExistingemail = { ...leanUser }
    userWithExistingemail.email = 'd@interieur.gouv.fr'
    const user = await createUser(leanUser)

    // When
    const error = await createUser(userWithExistingemail).catch(error => error)

    // Then
    expect(user).toBeDefined()
    expect(user).not.toBeInstanceOf(Error)
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('message', 'Validation failed')
  })

  it('Should not save a user with existing email', async () => {
    // Given
    const leanUser = createRandomValidUser()
    const userWithExistingEmail = { ...leanUser }
    userWithExistingEmail.email = '0325698'
    const user = await createUser(leanUser)

    // When
    const error = await createUser(userWithExistingEmail).catch(error => error)

    // Then
    expect(user).toBeDefined()
    expect(user).not.toBeInstanceOf(Error)
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('message', 'Validation failed')
  })

  it('Find users', async () => {
    // Given
    const firstUser = createRandomValidUser()
    const secondUser = createRandomValidUser()
    await createUser(firstUser)
    await createUser(secondUser)

    // When
    const users = await getAllUsers()

    // Then
    expect(users).toBeDefined()
    expect(users.length).toBeGreaterThanOrEqual(2)
  })

  it('Find user by id', async () => {
    // Given
    const leanUser = createRandomValidUser()
    const firstUser = await createUser(leanUser)

    // When
    const user = await getUserById(firstUser._id)

    // Then
    expect(user).toBeDefined()
    expect(user._id).toBeDefined()
  })

  it('Find user by email', async () => {
    // Given
    const firstUser = createRandomValidUser()
    await createUser(firstUser)

    // When
    const user = await getUserByemail(firstUser.email)

    // Then
    expect(user).toBeDefined()
    expect(user.email).toBeDefined()
  })

  it('Find users by email', async () => {
    // Given
    const leanUser1 = createRandomValidUser()
    const leanUser2 = createRandomValidUser()
    leanUser1.email = '8888999'
    leanUser2.email = '8888555'
    await createUser(leanUser1)
    await createUser(leanUser2)

    // When
    const [user1, user2] = await getUsersByemailMatching('8888')
    const [user] = await getUsersByemailMatching('88889')

    // Then
    expect(user1).toBeDefined()
    expect(user2).toBeDefined()
    expect(user.email).toBeDefined()
    expect(user.email).toBe(leanUser1.email)
    expect([leanUser1.email, leanUser2.email].includes(user2.email)).toBe(true)
  })

  it('Should return user by credentials', async () => {
    // Given
    const leanUsers = repeatFn(10)(createRandomValidUser)
    for (const leanUser of leanUsers) {
      await createUser(leanUser)
    }

    // When
    const user = await findUserByCredentials(leanUsers[9].email, leanUsers[9].password)

    // Then

    expect(user).toBeDefined()
    expect(user.email).toBeDefined()
    expect(user.email).toBe(String(leanUsers[9].email))
  })

  it('Should throw error on invalid credentials', async () => {
    // Given
    const leanUsers = repeatFn(10)(createRandomValidUser)
    for (const leanUser of leanUsers) {
      await createUser(leanUser)
    }

    // When
    const error = await findUserByCredentials(leanUsers[0].email, '1234').catch(error => error)

    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('message', 'emails invalides')
  })

  it('find user by credentials throw error if no user found', async () => {
    // Given
    const leanUsers = repeatFn(5)(createRandomValidUser)
    for (const leanUser of leanUsers) {
      await createUser(leanUser)
    }
    // When
    const error = await findUserByCredentials('x', '1234').catch(e => e)

    // Then
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty('message', 'emails invalides')
  })

  it('Update user by id', async () => {
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)

    const updatedUser = await updateUserById(user._id, { isValidatedEmail: true })

    expect(updatedUser).toBeDefined()
    expect(updatedUser).toHaveProperty('isValidatedEmail', true)
  })

  it('Should find several users by their id', async () => {
    const leanUsers = repeatFn(5)(createRandomValidUser)
    const users = await Promise.all(leanUsers.map(createUser))

    const userList = await getUsersById(users.filter((user, idx) => idx % 2).map(user => user.id))

    expect(userList).toBeDefined()
    expect(userList).toHaveLength(2)
    expect(userList[0]._id.toString()).toBe(users[1].id)
    expect(userList[1]._id.toString()).toBe(users[3].id)
  })
})
