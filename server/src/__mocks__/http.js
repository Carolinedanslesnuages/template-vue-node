import { vi } from 'vitest'

vi.genMockFromModule('http')

export default {
  createServer: vi.fn(
    () => {
      return {
        listen: vi.fn(),
      }
    },
  ),
}
