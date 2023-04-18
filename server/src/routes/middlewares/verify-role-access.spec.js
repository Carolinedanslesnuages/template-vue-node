import request from 'supertest'

import express from 'express'
import { verifyAccess } from './verify-role-access.js'
import { verifyToken } from './verify-token.js'

import { getConnection, closeConnections } from '../../connect'

import config from '../../config.js'
import { createToken } from '../../util/token.js'
import { createUser } from '../../models/user-queries.js'
import { createRandomValidUser } from '../../models/__tests__/user-util'
import { vi } from 'vitest'

vi.mock('../../config.js')

describe('verify Role Access', () => {
  const app = express()
  app.patch('/:id', verifyToken, verifyAccess, (req, res) => (res.json({ success: true })))

  let leanUser
  let userToModify

  let leanManager
  let manager

  let anotherLeanUser
  let anotherUser

  let mongodbMemServer

  beforeAll(async () => {
    mongodbMemServer = await getConnection()

    leanUser = await createRandomValidUser()
    userToModify = await createUser(leanUser)

    leanManager = await createRandomValidUser()
    leanManager.roles = [config.userRole.GESTIONNAIRE]
    manager = await createUser(leanManager)

    anotherLeanUser = await createRandomValidUser()
    anotherUser = await createUser(anotherLeanUser)
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })
  // Si je suis gestionnaire et je veux modifier les données d'un utilisateur inexistant
  // 404
  it('should return 404 if manager wants to update unexisting user', async () => {
    // Given
    const userToUpdateId = '60db1732d480da762e103f99'
    const token = createToken({ id: manager._id, roles: [config.userRole.GESTIONNAIRE] })
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
      .expect(404)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe("L'utilisateur n'existe pas")
  })

  // Si je ne suis pas gestionnaire et je veux modifier les données d'un autre utilisateur
  //
  it('should return 401 if not myself', async () => {
    // Given
    const userToUpdateId = userToModify.id
    const token = createToken({ id: anotherUser._id })
    const authHeader = ['Authorization', `Bearer ${token}`]

    const dataToUpdate = {
      firstname: 'Foo',
    }

    // When

    const response = await request(app)
      .patch('/' + userToUpdateId)
      .send(dataToUpdate)
      .set(...authHeader)
      .set('Content-Type', 'application/json')
    // Then
      .expect(401)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe("Accès non autorisé. Veuillez contactez l'administrateur.")
  })
})
