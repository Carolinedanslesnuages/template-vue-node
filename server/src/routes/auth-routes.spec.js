import request from 'supertest'
import express from 'express'

import { getConnection, closeConnections } from '../connect.js'
import { repeatFn } from '../__tests__/fp-util.js'
import authRouter from './auth-routes.js'
import { vi } from 'vitest'

vi.mock('../models/user-queries.js')
vi.mock('../config.js')

describe('', () => {
  let mongodbMemServer
  beforeAll(async () => {
    mongodbMemServer = await getConnection()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })

  const app = express()
  app.use(express.json())
  app.use(authRouter)

  it('should give access if email is validated', async () => {
    // Given
    const email = '0101010'
    const password = 'Agent78*'
    // When
    const response = await request(app)
      .post('/')
      .set('Accept', 'application/json')
      .send({
        email,
        password,
      })

    // Then
    expect(response.status).toEqual(201)
    expect(response.body).toHaveProperty('success', true)
  })

  it('Should explain in error that multiple wrong connections will block account', async () => {
    // Given
    const email = '0101010'
    const password = 'zaeraezr'
    // When
    const response = await request(app)
      .post('/')
      .set('Accept', 'application/json')
      .send({
        email,
        password,
      })
    // Then
    expect(response.status).toEqual(400)
    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('message', 'Veuillez vérifier vos emails ou réinitialiser votre mot de passe. Plusieurs tentatives infructueuses bloqueront votre compte.')
  })

  it('Should block connexion on a specific account if there is brute force suspicion', async () => {
    // Given
    const email = '0303030'
    const password = 'zaeraezr'
    // When
    const sendRequest = async () => {
      return request(app)
        .post('/')
        .set('Accept', 'application/json')
        .send({
          email,
          password,
        })
    }
    repeatFn(5)(sendRequest)
    const response = await sendRequest()
    // Then
    expect(response.status).toEqual(429)
    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('message', 'Nombre de tentatives dépassé. Veuillez vous connecter dans quelques minutes')
  })
})
