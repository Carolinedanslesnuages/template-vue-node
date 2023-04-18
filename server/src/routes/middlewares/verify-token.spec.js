import request from 'supertest'

import express from 'express'

import { verifyToken } from './verify-token.js'
import { createToken } from '../../util/token.js'
import { vi } from 'vitest'

vi.mock('../../config')

describe('verify token', () => {
  const app = express()
  app.use(verifyToken)
  app.get('/', (req, res) => (res.json({ success: true })))

  it('Invalid token should return 401', async () => {
    // Given

    // When
    const response = await request(app)
      .get('/')
      .expect(401)

    // Then
    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('message', 'Accès non autorisé')
  })

  it('Valid token should return 200', async () => {
    // Given
    const token = createToken({ id: 1 })
    const authHeader = ['Authorization', `Bearer ${token}`]

    // When
    const response = await request(app)
      .get('/')
      .set(...authHeader)
      .expect(200)

    // Then
    expect(response.body.success).toBe(true)
  })
})
