import nodemailer from 'nodemailer'
import { getMailInfo, sendMail } from './send-mail.js'
import { vi } from 'vitest'

vi.mock('nodemailer')
const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('send a mail', () => {
  it(' Should send a mail', async () => {
    // Given
    const to = 'to@interieur.gouv.fr'
    const subject = 'Hello world!'
    const content = '<h1>Hello world!</h1>'
    const mailInfo = getMailInfo(to, subject, content)

    // When
    await sendMail(to, { subject, body: content })

    // Then
    expect(nodemailer.createTransport).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock.mock.calls[0][0]).toMatchObject(mailInfo)
  })
})
