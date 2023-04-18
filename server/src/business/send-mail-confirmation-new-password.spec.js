import nodemailer from 'nodemailer'
import {
  sendMailConfirmationPassword,
  getMailConfirmationTemplate,
  getMailConfirmationBody,
  getMailConfirmation,
} from './send-mail-confirmation-new-password.js'
import { vi } from 'vitest'

vi.mock('nodemailer')
const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('sendMailResetLink', () => {
  beforeEach(() => {
    sendMailMock.mockClear()
  })

  it('Should use sendMail', async () => {
    // Given
    const email = 'whatever@interieur.gouv.fr'

    // When
    await sendMailConfirmationPassword(email)

    // Then
    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(sendMailMock.mock.calls[0][0].to).toBe(email)
  })

  it('Should return a template with appropriate text', () => {
    const email = 'whatever@interieur.gouv.fr'

    const body = getMailConfirmationTemplate(email)

    expect(body).toContain('Votre mot de passe a bien été réinitialisé.')
  })

  it('Should return the mail body', () => {
    const email = 'whatever@interieur.gouv.fr'

    const body = getMailConfirmationBody(email)

    expect(body).toContain('Email de APP')
    expect(body).toContain('Votre mot de passe a bien été réinitialisé.')
  })

  it('Should return an object with subject and body', () => {
    const email = 'whatever@interieur.gouv.fr'

    const mailInfo = getMailConfirmation(email)

    expect(mailInfo).toHaveProperty('subject')
    expect(mailInfo).toHaveProperty('body')
    expect(mailInfo.body).toContain('Email de APP')
    expect(mailInfo.body).toContain('Votre mot de passe a bien été réinitialisé.')
  })
})
