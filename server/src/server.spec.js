import { createServer } from 'http'
import { getPort, startServer, handleExit, DEFAULT_PORT, exitGracefuly } from './server.js'
import { getConnection, closeConnections } from './connect.js'
import { techLogger } from './util/logger.js'
import { vi } from 'vitest'

vi.mock('http', () => ({ createServer: vi.fn(() => ({ listen: vi.fn() })) }))
vi.mock('./app.js')
vi.mock('./connect.js')
vi.mock('./util/logger.js')

describe('Server', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it(`Should return ${DEFAULT_PORT}`, () => {
    // When
    const port = getPort()

    // Then
    expect(port).toBe(DEFAULT_PORT)
  })

  it('Should call process.on 4 times', () => {
    // Given
    const processOn = vi.spyOn(process, 'on')

    // When
    handleExit()

    // Then
    expect(processOn.mock.calls).toHaveLength(4)
  })

  it('Should getConnection', async () => {
    // When
    await startServer().catch(error => console.warn(error))

    // Then
    expect(getConnection.mock.calls).toHaveLength(1)
    expect(createServer.mock.calls).toHaveLength(2)
  })

  it('Should throw error', async () => {
    // Given
    getConnection.mockReturnValueOnce(Promise.reject(new Error('This is OK!')))

    // When
    await startServer().catch(error => console.warn(error))

    // Then
    expect(getConnection.mock.calls).toHaveLength(1)
    expect(createServer.mock.calls).toHaveLength(0)
  })

  it('Should call closeConnections with no parameters', async () => {
    // Given
    process.exit = vi.fn()

    // When
    await exitGracefuly()

    // Then
    expect(closeConnections.mock.calls).toHaveLength(1)
    expect(closeConnections.mock.calls[0]).toHaveLength(0)
    expect(techLogger.error.mock.calls).toHaveLength(0)
  })

  it('Should log an error', async () => {
    // Given
    process.exit = vi.fn()

    // When
    await exitGracefuly(new Error())

    // Then
    expect(closeConnections.mock.calls).toHaveLength(1)
    expect(closeConnections.mock.calls[0]).toHaveLength(0)
    expect(techLogger.error.mock.calls).toHaveLength(1)
    expect(techLogger.error.mock.calls[0][0]).toBeInstanceOf(Error)
  })
})
