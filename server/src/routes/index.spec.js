import request from 'supertest'

import express from 'express'

import pkg from '../../package.json'

import { getConnection, closeConnections } from '../connect.js'

import router from './index.js'
import { vi } from 'vitest'

vi.mock('../config')

const app = express()

app.use(router)

describe('app', () => {
  let mongodbMemServer
  beforeAll(async () => {
    mongodbMemServer = await getConnection()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })
  it('should respond with the version', async () => {
    const response = await request(app)
      .get('/version')
      .expect(200)
    expect(response.body).toBe(pkg.version)
  })
})
