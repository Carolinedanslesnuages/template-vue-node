import {
  getUtcDateFromCurrenTzDate,
  getJSDateFromUtcIso,
  getCurrentTzTimeFromUtc,
  isBeforeExisting,
} from './date-util.js'

describe('date-util', () => {
  it('Should return a french zoned time Date object', () => {
    const date = '2020-01-01'

    const currentTzDate = getUtcDateFromCurrenTzDate(date)

    const hour = +currentTzDate.toISOString().split('T')[1].split(':')[0]
    const wholeDate = currentTzDate.toISOString().split('T')[0]
    const day = +wholeDate.split('-')[2]
    const month = +wholeDate.split('-')[1]

    expect(currentTzDate).toBeInstanceOf(Date)
    expect(typeof hour).toBe('number')
    expect(typeof day).toBe('number')
    expect(typeof month).toBe('number')
  })

  it('Should return a native Date object', () => {
    const date = '2020-02-02'

    const received = getJSDateFromUtcIso(date)

    expect(received.getMonth()).toBe(1)
    expect(received.getFullYear()).toBe(2020)
    expect(received.getDate()).toBeGreaterThan(1)
    expect(received.getDate()).toBeLessThan(4)
  })

  it('Should return a local dateTime without seconds and milliseconds', () => {
    const getDateFromISOString = '2020-02-02T20:21:21.000Z'

    const dateTime = getCurrentTzTimeFromUtc(getDateFromISOString)

    expect(dateTime).toBe('2020-02-02T21:21')
    expect(/\d{2}:\d{2}/.test(dateTime)).toBe(true)
  })

  it('Should return false if date is empty string', () => {
    const isoString = '2020-02-02T20:21:21.000Z'
    const emptyString = ''

    const isFalse = isBeforeExisting(isoString)(emptyString)

    expect(isFalse).toBe(false)
  })
})
