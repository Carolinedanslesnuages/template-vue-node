import { compareToHash, getHash } from './crypto'

describe('crypto', () => {
  it('Should return true for matching password', () => {
    // Given
    const password = '53cr47P455!'
    const bcryptedPassword = getHash(password)

    // When
    const received = compareToHash(password, bcryptedPassword)

    // Then
    expect(received).toBe(true)
  })
})
