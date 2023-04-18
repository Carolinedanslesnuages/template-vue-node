import jwt from 'jsonwebtoken'

import { createToken, checkToken, options } from './token.js'
import config from '../config.js'
import { vi } from 'vitest'

vi.mock('jsonwebtoken')
vi.mock('../config')

describe('token', () => {
  it('Should call jwt.sign with appropriate arguments', () => {
    const payload = { id: 1 }

    createToken(payload)

    expect(jwt.sign).toHaveBeenCalled()
    expect(jwt.sign).toHaveBeenCalledTimes(1)
    expect(jwt.sign.mock.calls[0][0]).toMatchObject(payload)
    expect(jwt.sign.mock.calls[0][1]).toBe(config.secret)
    expect(jwt.sign.mock.calls[0][2]).toMatchObject(options)
  })

  it('Should call jwt.verify with appropriate arguments', () => {
    const token = 'abcd'
    checkToken(token)

    expect(jwt.verify).toHaveBeenCalled()
    expect(jwt.verify).toHaveBeenCalledTimes(1)
    expect(jwt.verify.mock.calls[0][0]).toBe(token)
    expect(jwt.verify.mock.calls[0][1]).toBe(config.secret)
  })
})
