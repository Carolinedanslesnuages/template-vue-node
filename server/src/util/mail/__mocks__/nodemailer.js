import { vi } from 'vitest'

vi.genMockFromModule('nodemailer')

export default {
  createTransport: vi.fn(),
}
