import { validatePassword, validateEmail } from './regex-util.js'

describe('Regex util functions', () => {
  it('should not accept weak password', () => {
    const weakPassword = '1234'

    const isValidPassword = validatePassword(weakPassword)

    expect(isValidPassword).toBe(false)
  })

  it('should accept strong password', () => {
    const weakPassword = 'aUei@1234'

    const isValidPassword = validatePassword(weakPassword)

    expect(isValidPassword).toBe(true)
  })

  it('Should validate email', () => {
    const email = '7897789'

    const isValidEmail = validateEmail(email)

    expect(isValidEmail).toBe(true)
  })

  it('Should invalidate email', () => {
    const email = '789'

    const isValidEmail = validateEmail(email)

    expect(isValidEmail).toBe(false)
  })

  it('Should invalidate email', () => {
    const email = undefined

    const isValidEmail = validateEmail(email)

    expect(isValidEmail).toBe(false)
  })

  it('Should validate email address', () => {
    const email = 'test@mainbot.me'

    const isValidEmail = validateEmail(email)

    expect(isValidEmail).toBe(true)
  })

  it('Should invalidate email address', () => {
    const email = 'test@Maintbot.fr'

    const isValidEmail = validateEmail(email)

    expect(isValidEmail).toBe(false)
  })

})
