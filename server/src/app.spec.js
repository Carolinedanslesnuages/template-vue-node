import request from 'supertest'
import { getConnection, closeConnections } from './connect.js'
import app, { apiPrefix } from './app.js'
import { vi } from 'vitest'

import pkg from '../package.json'

vi.mock('./config')

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
      .get(`${apiPrefix}/version`)
      .expect(200)
    expect(response.body).toBe(pkg.version)
  })
})
