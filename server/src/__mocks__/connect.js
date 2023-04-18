import { vi } from 'vitest'

export const getConnection = vi.fn(
  () => Promise.resolve(),
)

export const exitGracefuly = vi.fn()

export const closeConnections = vi.fn()
