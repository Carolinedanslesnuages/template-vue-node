
import { vi } from 'vitest'
import { apiClient } from './xhr-client.js'
import {
  saveUser,
  getUserById,
  getUsersByMatching,
} from './api.js'

vi.spyOn(apiClient, 'get')
vi.spyOn(apiClient, 'post')
vi.spyOn(apiClient, 'put')
vi.spyOn(apiClient, 'patch')
vi.spyOn(apiClient, 'delete')

describe('api', () => {
  beforeEach(() => {
    apiClient.get.mockClear()
    apiClient.post.mockClear()
    apiClient.put.mockClear()
    apiClient.patch.mockClear()
    apiClient.delete.mockClear()
  })

  it('Should POST a user', async () => {
    // Given
    const user = {}
    apiClient.post.mockReturnValueOnce(Promise.resolve({ data: { success: true } }))

    // When
    await saveUser(user)

    // Then
    expect(apiClient.post).toHaveBeenCalled()
    expect(apiClient.post).toHaveBeenCalledTimes(1)
    expect(apiClient.post.mock.calls[0][0]).toBe('/users')
    expect(apiClient.post.mock.calls[0][1]).toBe(user)
  })

  it('Should GET a user', async () => {
    // Given
    const userId = 1
    apiClient.get.mockReturnValueOnce(Promise.resolve({ data: { success: true } }))

    // When
    await getUserById(userId)

    // Then
    expect(apiClient.get).toHaveBeenCalled()
    expect(apiClient.get).toHaveBeenCalledTimes(1)
    expect(apiClient.get.mock.calls[0][0]).toBe(`/users/${userId}`)
  })

  it('Should GET users', () => {
    // Given
    const emailPart = '007'
    apiClient.get.mockReturnValueOnce(Promise.resolve({ data: { success: true } }))

    // When
    getUsersByMatching(emailPart)

    // Then
    expect(apiClient.get).toHaveBeenCalled()
    expect(apiClient.get).toHaveBeenCalledTimes(1)
    expect(apiClient.get.mock.calls[0][0]).toBe(`/users?matching=${emailPart}`)
  })

})
