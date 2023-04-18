import request from 'supertest'
import express from 'express'
import nodemailer from 'nodemailer'

import { getConnection, closeConnections } from '../connect.js'

import { createRandomValidUser, createRandomWeakPassword } from '../models/__tests__/index.js'

import userRouter from './user-routes.js'
import authRouter from './auth-routes.js'
import { createUser } from '../models/user-queries.js'
import { createToken } from '../util/token.js'
import config from '../config.js'
import { vi } from 'vitest'

vi.mock('nodemailer')
vi.mock('../config')

const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('', () => {
  let app
  let mongodbMemServer

  let leanUser
  let userToUpdate

  let leanManager
  let manager

  beforeAll(async () => {
    mongodbMemServer = await getConnection()

    leanUser = await createRandomValidUser()
    userToUpdate = await createUser(leanUser)

    leanManager = await createRandomValidUser()
    leanManager.roles = [config.userRole.GESTIONNAIRE]
    manager = await createUser(leanManager)

    app = express()
    app.use(express.json())
    app.use(userRouter)
    app.use(authRouter)

    app.use((err, req, res, next) => {
      res.status(500)
      res.json({ success: false, error: err.message })
    })
  })

  afterEach(() => {
    sendMailMock.mockClear()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })

  it('Should create a user', async () => {
    // Given
    const user = createRandomValidUser()
    user.confirmemail = user.email
    user.confirmPassword = user.password
    user.confirmEmail = user.email

    // When
    const response = await request(app)
      .post('/')
      .send(user)
      .expect('content-type', /^application\/json/)
      .expect(201)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(true)
    expect(response.body.user).toBeDefined()
    expect(response.body.user.firstname).toBe(user.firstname)
    expect(response.body.user.profile).toBe(user.profile)
    expect(response.body.user.createdAt).toBeDefined()
  })

  it('Should not create a user with weak password', async () => {
    // Given
    const user = createRandomWeakPassword()
    user.confirmemail = user.email
    user.confirmPassword = user.password
    user.confirmEmail = user.email

    // When
    const response = await request(app)
      .post('/')
      .send(user)
      .expect('content-type', /^application\/json/)
      .expect(400)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBeDefined()
    expect(response.body.message).toBe("Votre mot de passe n'est pas assez fort")
  })

  it('Should not create a user with bad confirmPassword', async () => {
    // Given
    const user = createRandomValidUser()

    // When
    const response = await request(app)
      .post('/')
      .send(user)
      .expect('content-type', /^application\/json/)
      .expect(400)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBeDefined()
    expect(response.body.message).toBe('Oups ! Les emails ne correspondent pas')
  })

  it('Should not create a user without firstname and lastname', async () => {
    // Given
    const user = createRandomValidUser()
    user.confirmPassword = user.password
    delete user.firstname
    delete user.lastname
    delete user.email
    delete user.profile
    delete user.service
    delete user.email

    // When
    const response = await request(app)
      .post('/')
      .send(user)
      .expect('content-type', /^application\/json/)
      .expect(400)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBeDefined()
    expect(response.body.messages).toContain("Vous n'avez pas indiqué de prénom (non renseigné)")
    expect(response.body.messages).toContain("Vous n'avez pas indiqué de nom (non renseigné)")
    expect(response.body.messages).toContain("Vous n'avez pas indiqué d'adresse courriel (non renseigné)")
    expect(response.body.messages).toContain("Vous n'avez pas indiqué de service (non renseigné)")
    expect(response.body.messages).toContain("Vous n'avez pas indiqué de email (non renseigné)")
  })

  it('should not create a user with existing email', async () => {
    // Given
    const leanUser = createRandomValidUser()
    leanUser.confirmemail = leanUser.email
    leanUser.confirmPassword = leanUser.password
    leanUser.confirmEmail = leanUser.email

    const userWithExistingEmail = { ...leanUser }
    userWithExistingEmail.email = '0325698'

    // When
    const originalUser = await request(app)
      .post('/')
      .send(leanUser)
      .expect('content-type', /^application\/json/)
      .expect(201)

    const error = await request(app)
      .post('/')
      .send(userWithExistingEmail)
      .expect('content-type', /^application\/json/)
      .expect(400)

    expect(originalUser).toBeDefined()
    expect(error).toBeDefined()
    expect(error.body).toHaveProperty('success', false)
    expect(error.body).toHaveProperty('message')
  })

  it('should not create a user with existing email', async () => {
    // Given
    const leanUser = createRandomValidUser()
    leanUser.confirmemail = leanUser.email
    leanUser.confirmPassword = leanUser.password
    leanUser.confirmEmail = leanUser.email

    const userWithExistingemail = { ...leanUser }
    userWithExistingemail.email = 'james.bond@interieur.gouv.fr'

    // When
    const originalUser = await request(app)
      .post('/')
      .send(leanUser)
      .expect('content-type', /^application\/json/)
      .expect(201)

    const error = await request(app)
      .post('/')
      .send(userWithExistingemail)
      .expect('content-type', /^application\/json/)
      .expect(400)

    expect(originalUser).toBeDefined()
    expect(error).toBeDefined()
    expect(error.body).toHaveProperty('success', false)
    expect(error.body).toHaveProperty('message')
  })

  it('should return a list of users', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]
    const user1 = createRandomValidUser()
    const user2 = createRandomValidUser()
    const user3 = createRandomValidUser()

    await createUser(user1)
    await createUser(user2)
    await createUser(user3)
    // When

    const response = await request(app)
      .get('/')
      .set(...authHeader)
      .expect('content-type', /^application\/json/)
      .expect(200)
    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.users).toBeDefined()
    expect(response.body.users).toBeInstanceOf(Array)
  })

  it('should return a user with id', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]
    const leanUser1 = createRandomValidUser()
    const leanUser2 = createRandomValidUser()
    const leanUser3 = createRandomValidUser()
    const user1 = await createUser(leanUser1)
    await createUser(leanUser2)
    await createUser(leanUser3)

    // When
    const route = `/${user1._id}`
    const response = await request(app)
      .get(route)
      .set(...authHeader)
      .expect('content-type', /^application\/json/)
      .expect(200)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(true)
    expect(response.body.user).toBeDefined()
    expect(response.body.user._id).toStrictEqual(String(user1._id))
    expect(response.body.user).toBeInstanceOf(Object)
  })

  it('should return a user with a email', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]
    const leanUser1 = createRandomValidUser()
    const leanUser2 = createRandomValidUser()
    const leanUser3 = createRandomValidUser()
    const user1 = await createUser(leanUser1)
    await createUser(leanUser2)
    await createUser(leanUser3)

    // When
    const route = `/?matching=${user1.email}`
    const response = await request(app)
      .get(route)
      .set(...authHeader)
      .expect('content-type', /^application\/json/)
      .expect(200)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(true)
    expect(response.body.users).toBeDefined()
    expect(response.body.users[0].email).toStrictEqual(user1.email)
    expect(response.body.users[0]._id).toStrictEqual(String(user1._id))
  })

  it('should return a user with a lastname', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]
    const leanUser1 = createRandomValidUser()
    const leanUser2 = createRandomValidUser()
    const leanUser3 = createRandomValidUser()
    const user1 = await createUser(leanUser1)
    await createUser(leanUser2)
    await createUser(leanUser3)

    // When
    const regex = user1.lastname
    const route = `/?matching=${regex}`
    const response = await request(app)
      .get(route)
      .set(...authHeader)
      .expect('content-type', /^application\/json/)
      .expect(200)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(true)
    expect(response.body.users).toBeDefined()
    response.body.users.forEach(dbUser => {
      expect(dbUser.lastname).toMatch(`${regex}`)
    })
    const matchingIdCounter = response.body.users.reduce((acc, cur) => {
      return acc + Number(cur._id === user1._id.toString())
    }, 0)
    expect(matchingIdCounter).toStrictEqual(1)
  })

  it('should return a user with a firstname', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]
    const leanUser1 = createRandomValidUser()
    const leanUser2 = createRandomValidUser()
    const leanUser3 = createRandomValidUser()
    const user1 = await createUser(leanUser1)
    await createUser(leanUser2)
    await createUser(leanUser3)

    // When
    const regex = user1.firstname
    const route = `/?matching=${regex}`
    const response = await request(app)
      .get(route)
      .set(...authHeader)
      .expect('content-type', /^application\/json/)
      .expect(200)

    // Then
    expect(response.body.success).toBeDefined()
    expect(response.body.success).toBe(true)
    expect(response.body.users).toBeDefined()
    response.body.users.forEach(dbUser => {
      expect(dbUser.firstname).toMatch(`${regex}`)
    })
    const matchingIdCounter = response.body.users.reduce((acc, cur) => {
      return acc + Number(cur._id === user1._id.toString())
    }, 0)
    expect(matchingIdCounter).toStrictEqual(1)
  })

  it('Should validate mail user', async () => {
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)

    const response = await request(app)
      .patch(`/${user.id}`)
      .send({
        h: user.emailValidationHash,
      })
      .expect('content-type', /^application\/json/)
      .expect(200)

    expect(response.body).toBeDefined()
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('updatedUser')

    const updatedUser = response.body.updatedUser
    expect(updatedUser).toHaveProperty('isValidatedEmail', true)

    const emailValidatedAtDate = new Date(updatedUser.emailValidatedAt)
    const now = Date.now()
    expect(emailValidatedAtDate.getTime()).toBeLessThan(now)
    expect(emailValidatedAtDate.getTime()).toBeGreaterThan(now - 2000)

    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock.mock.calls[0][0]).toHaveProperty('html')
    expect(sendMailMock.mock.calls[0][0].html).toContain(updatedUser.email)
  })

  it('Should update user (my profile) by Id ', async () => {
    const token = createToken({ id: userToUpdate.id })
    const authHeader = ['Authorization', `Bearer ${token}`]

    delete userToUpdate.email
    delete userToUpdate.password

    const modifiedUser = {
      ...userToUpdate,
      firstname: 'Marie',
    }

    const route = `/${userToUpdate.id}`
    const justBefore = Date.now()

    const response = await request(app)
      .patch(route)
      .set('Accept', 'application/json')
      .set(...authHeader)
      .send(modifiedUser)
      .expect(200)

    expect(response.body.success).toBeDefined()
    expect(response.body.user).toBeDefined()
    expect(response.body.message).toBe('Le profil a été modifié')
    expect(response.body.user).toBeInstanceOf(Object)
    expect(response.body.user.firstname).toBe('Marie')
    expect(new Date(response.body.user.updatedAt).getTime()).toBeGreaterThan(justBefore)
  })

  it('Should update user by Id return 401', async () => {
    const leanUser = createRandomValidUser()
    const savedUser = await createUser(leanUser)

    delete leanUser.email
    delete leanUser.password

    const modifiedUser = {
      ...savedUser,
      firstname: 'Marie',
    }

    const route = `/${savedUser.id}`

    const response = await request(app)
      .patch(route)
      .send(modifiedUser)
      .set('Accept', 'application/json')
      .expect(401)

    expect(response.body.success).toBeDefined()
    expect(response.body.message).toBe('Accès non autorisé')
  })

  it('Should send an new email validation if adresse email not yet validate ', async () => {
    const leanUser = createRandomValidUser()
    const savedUser = await createUser(leanUser)
    const email = savedUser.email

    const route = '/reset-link'

    const response = await request(app)
      .post(route)
      .send({
        email,
      })
      .set('Accept', 'application/json')
      .expect(400)

    expect(response.body).toHaveProperty('success', false)
    expect(response.body.message).toBe("Votre adresse courriel n'a pas encore été validée. Un nouveau mail de validation vous a été envoyé")
  })

  it('Should send a reset password email', async () => {
    const leanUser = createRandomValidUser()
    const savedUser = await createUser(leanUser)
    const email = savedUser.email
    savedUser.isValidatedEmail = true
    savedUser.emailValidatedAt = new Date()
    await savedUser.save()

    const route = '/reset-link'

    const response = await request(app)
      .post(route)
      .send({ email })
      .set('Accept', 'application/json')
      .expect(201)

    expect(response.body).toHaveProperty('success', true)
  })

  it('should return 403 if I try to modify my profileIjValidationDate', async () => {
    // Given
    const userToUpdateId = userToUpdate.id
    const token = createToken({ id: userToUpdate._id })
    const authHeader = ['Authorization', `Bearer ${token}`]

    const dataToUpdate = {
      profileIjValidationDate: new Date(),
    }
    // When
    const response = await request(app)
      .patch('/' + userToUpdateId)
      .send(dataToUpdate)
      .set(...authHeader)
      .set('Content-Type', 'application/json')
      // Then
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Accès interdit')
  })

  it('should return 403 if manager tries to modify something else than profileIjValidationDate', async () => {
    // Given
    const userToUpdateId = userToUpdate.id
    const token = createToken({ id: manager._id, roles: [config.userRole.GESTIONNAIRE] })
    const authHeader = ['Authorization', `Bearer ${token}`]

    const dataToUpdate = {
      firstname: 'Foo',
      profileIjValidationDate: new Date(),
    }
    // When
    const response = await request(app)
      .patch('/' + userToUpdateId)
      .send(dataToUpdate)
      .set(...authHeader)
      .set('Content-Type', 'application/json')
    // Then
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Accès interdit')
  })

  it('should return 403 if manager tries to modify profileIjValidationDate and user has made no request', async () => {
    // Given
    const userToUpdateId = userToUpdate.id

    const token = createToken({ id: manager._id, roles: [config.userRole.GESTIONNAIRE] })
    const authHeader = ['Authorization', `Bearer ${token}`]

    const dataToUpdate = {
      profileIjValidationDate: new Date(),
    }
    // When
    await request(app)
      .patch('/' + userToUpdateId)
      .send(dataToUpdate)
      .set(...authHeader)
      .set('Content-Type', 'application/json')
    // Then
      .expect(403)
  })
})
