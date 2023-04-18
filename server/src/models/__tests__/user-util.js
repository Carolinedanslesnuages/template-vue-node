import slugify from '@sindresorhus/slugify'
import { faker } from '@faker-js/faker/locale/fr'

/**
 * Generate valid user data for automated tests
 *
 * @function
 *
 * @returns {import('../models/user-model').UserData}
 */
export function createRandomValidUser () {
  const firstname = faker.name.firstName()
  const lastname = faker.name.lastName()
  const email = `${slugify(firstname)}.${slugify(lastname)}-${faker.datatype.number({ min: 0, max: 999999 })}@interieur.gouv.fr`
  return {
    firstname,
    lastname,
    email,
    service: '69-SDPTS Lyon',
    email: faker.datatype.number({ min: 1000000, max: 9999999 }),
    password: 'Amd586tesarn*',
  }
}

export function createRandomWeakPassword () {
  const firstname = faker.name.firstName()
  const lastname = faker.name.lastName()
  const email = `${slugify(firstname)}.${slugify(lastname)}@interieur.gouv.fr`
  return {
    firstname,
    lastname,
    email,
    service: faker.name.jobTitle(),
    email: faker.datatype.number({ min: 1000000, max: 9999999 }),
    password: '12345',
  }
}

export function createRandomUserWithInvalidEmail () {
  const firstname = faker.name.firstName()
  const lastname = faker.name.lastName()
  const email = faker.internet.email()
  return {
    firstname,
    lastname,
    email,
    service: faker.name.jobTitle(),
    email: faker.datatype.number({ min: 1e5, max: 1e7 - 1 }),
    password: faker.random.alphaNumeric(),
  }
}
