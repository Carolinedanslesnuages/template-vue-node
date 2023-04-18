import nodemailer from 'nodemailer'
import { getMailFrom } from '../util/mail/send-mail-config.js'
import { computeValidateEmailLink, getValidateEmailMailTemplate, sendMailValidateEmail } from './send-mail-validate-email.js'
import { vi } from 'vitest'

vi.mock('nodemailer')
vi.mock('../config')

const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('Email de validation du courriel ', () => {
  beforeEach(() => {
    sendMailMock.mockClear()
  })

  it('Template email ', () => {
    const link = computeValidateEmailLink()
    const content = getValidateEmailMailTemplate(link)
    expect(content).toContain('lorem Ipsum')
    expect(content).toContain(link)
  })

  it('Should send an email with a link', async () => {
    // Given
    const to = 'to@example.com'

    // When
    await sendMailValidateEmail('1234abcd', to)

    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(sendMailMock.mock.calls[0][0].to).toBe(to)
    expect(sendMailMock.mock.calls[0][0].from).toBe(getMailFrom())
    expect(sendMailMock.mock.calls[0][0].subject).toBe('APP - Validez votre adresse courriel')
    expect(sendMailMock.mock.calls[0][0].html).toContain('Lorem Ipsum')
  })
})
