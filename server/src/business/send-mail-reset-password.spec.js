import nodemailer from 'nodemailer'
import { getConnection, closeConnections } from '../connect'
import {
  sendMailResetLink,
  getResetLinkTemplate,
  getResetLinkMailBody,
  getResetLinkMail,
  getUrlResetLink,
} from './send-mail-reset-password.js'
import { createRandomValidUser } from '../models/__tests__'
import { createUser } from '../models/user-queries'
import { vi } from 'vitest'

vi.mock('nodemailer')
vi.mock('../config')

const sendMailMock = vi.fn(() => 'Infos du mail')
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })

describe('sendMailResetLink', () => {
  let mongodbMemServer
  beforeAll(async () => {
    mongodbMemServer = await getConnection()
  })

  afterAll(async () => {
    return closeConnections(mongodbMemServer)
  })

  beforeEach(() => {
    sendMailMock.mockClear()
  })

  it('Should use sendMail', async () => {
    // Given
    // Créer un utilisateur
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)
    const email = user.email

    // When on utilise la fonction sendMailResetLink(email)
    await sendMailResetLink(email)

    // Then on vérifie que sendMail a été appelée
    expect(sendMailMock).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    expect(sendMailMock.mock.calls[0][0].to).toBe(email)
  })

  it('Should return a template with appropriate link', () => {
    const body = getResetLinkTemplate('dummy-link')

    expect(body).toContain('href="dummy-link"')
  })

  it('Should return the mail body', () => {
    const body = getResetLinkMailBody('dummy-link')
    expect(body).toContain('href="dummy-link"')
  })
  it('Should return an object with subject and body', () => {
    const mailInfo = getResetLinkMail('dummy-link')
    expect(mailInfo).toHaveProperty('subject')
    expect(mailInfo).toHaveProperty('body')

    expect(mailInfo.body).toContain('Email de APP')
    expect(mailInfo.body).toContain('dummy-link')
  })
  it('Should return a route with email and hash in query', async () => {
    const leanUser = createRandomValidUser()
    const user = await createUser(leanUser)
    const email = user.email

    const resetLink = await getUrlResetLink(email)

    expect(resetLink).toContain('/utilisateurs/reinitialisation-lien?email=')
  })
})
