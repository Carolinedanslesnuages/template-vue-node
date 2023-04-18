import { vi } from 'vitest'

const users = [
  {
    _id: '6001a65ecbe6ff22c805cbc3',
    email: 'jean.martin@interieur.gouv.fr',
    password: 'Agent78*',
    updatedAt: '2021-04-06T08:16:37.393Z',
    createdAt: '2021-01-15T14:27:42.461Z',
    isValidatedEmail: true,
    emailValidatedAt: '2021-01-15T14:27:49.120Z',
  },
  {
    _id: '6001a65ecbe6ff22c805cbc4',
    email: 'jacques.dupond@interieur.gouv.fr',
    password: 'Agent78*',
    updatedAt: '2021-04-06T08:16:37.393Z',
    createdAt: '2021-01-15T14:27:42.461Z',
    isValidatedEmail: true,
    emailValidatedAt: '2021-01-15T14:27:49.120Z',
  },
  {
    _id: '6001a65ecbe6ff22c805cbc3',
    email: 'albert.dupond@interieur.gouv.fr',
    password: 'Agent78*',
    updatedAt: '2021-04-06T08:16:37.393Z',
    createdAt: '2021-01-15T14:27:42.461Z',
    isValidatedEmail: true,
    emailValidatedAt: '2021-01-15T14:27:49.120Z',
  },
]

export const getUserById = vi.fn(id => {
  return users.find(user => user._id === id)
})

export const findUserByCredentials = vi.fn((email, password) => {
  return users.find(user => user.email === email && user.password === password)
})
