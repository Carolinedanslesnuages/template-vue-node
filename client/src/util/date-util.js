import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz/fp'
import { parseISO } from 'date-fns/fp'

const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone
const pattern = 'yyyy-MM-dd HH:mm'
export const getSimpleFrenchFormat = format(pattern)

const getUtcFromCurrentZoneTime = zonedTimeToUtc(currentTz)
const getCurrentZoneTimeFromUtc = utcToZonedTime(currentTz)

export function getUtcIsoFromCurrentTzDateTime (dateTime) {
  return (getUtcFromCurrentZoneTime(dateTime)).toISOString()
}

export function getUtcDateFromCurrenTzDate (date) {
  return getUtcFromCurrentZoneTime(`${date} 00:00:00`)
}

export function getJSDateFromUtcIso (dateUtcIso) {
  return parseISO(dateUtcIso)
}

export function getCurrentTzTimeFromUtc (dateUtcIso) {
  const dateTime = getCurrentZoneTimeFromUtc(dateUtcIso)
  return getSimpleFrenchFormat(dateTime).replace(' ', 'T')
}

export function getCurrentTzObjectFromUtc (dateUtcIso) {
  const currentTzDateTime = getCurrentTzTimeFromUtc(dateUtcIso)
  const date = formatDateTime(currentTzDateTime).split(' - ')[0]
  const time = formatDateTime(currentTzDateTime).split(' - ')[1]
  return { date, time }
}

export const regexDatetimeLocal = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

export const toFrDate = dateiso => dateiso.replace(regexDatetimeLocal, '$3/$2/$1 $4:$5')

export const isDate = date => {
  return date instanceof Date || (date.toString().length > 4 && getJSDateFromUtcIso(date).toString() !== 'Invalid Date')
}

export const ISODate = date => {
  return new Date(date)
}

export const now = () => {
  return ISODate(Date.now())
}

export const isAfterExisting = function (dateToCompare) {
  return function (date) {
    return !dateToCompare ||
    (dateToCompare && ISODate(date).getTime() >= ISODate(dateToCompare).getTime())
  }
}

export const isBeforeExisting = function (dateToCompare) {
  return function (date) {
    return !dateToCompare ||
    (dateToCompare && ISODate(date).getTime() <= ISODate(dateToCompare).getTime())
  }
}

export const isBeforeNow = function (date) {
  return ISODate(date).getTime() <= now().getTime()
}
