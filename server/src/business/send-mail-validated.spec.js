import nodemailer from 'nodemailer'

import {
  getMailEmailValidatedContent,
  sendMailValidatedEmail,
} from './send-mail-validated.js'
import { getMailFrom } from '../util/mail/send-mail-config.js'
import { vi } from 'vitest'

vi.mock('nodemailer')
const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('Email de confirmation de validation du courriel', () => {
  beforeEach(() => {
    sendMailMock.mockClear()
  })

  it('Template email', () => {
    const email = 'to@example.com'
    const content = getMailEmailValidatedContent(email)
    expect(content).toContain(`<p> Votre adresse courriel ${email} est validée. </p>`)
  })

  it('Should send an email of validation', async () => {
    const to = 'to@example.com'

    await sendMailValidatedEmail(to)

    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(sendMailMock.mock.calls[0][0].to).toBe(to)
    expect(sendMailMock.mock.calls[0][0].from).toBe(getMailFrom())
    expect(sendMailMock.mock.calls[0][0].subject).toBe('APP - Votre adresse courriel est validée')
  })
})
