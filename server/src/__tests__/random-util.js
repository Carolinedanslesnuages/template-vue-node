import { faker } from '@faker-js/faker/locale/fr'
import { subDays } from 'date-fns'

export function getRandomString () {
  return faker.random.word() + '-' + faker.random.word()
}

export function getRandomDateTimes () {
  const first = subDays(faker.date.recent(), 2)
  const second = subDays(faker.date.recent(), 2)

  const invert = first > second
  return {
    before: invert ? second : first,
    after: invert ? first : second,
  }
}

export function getRandomNumber (min = 0, max = 99) {
  return Number((Math.random() * (max + 1 - min) + min).toFixed(6))
}

export function getRandomInteger (min = 0, max = 99) {
  return Math.floor(Math.random() * (max + 1 - min) + min)
}
