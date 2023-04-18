const { parseISO } = require('date-fns/fp')
const { format, zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz/fp')

const parisTz = 'Europe/Paris'
const pattern = 'yyyy-MM-dd HH:mm'
const getSimpleFrenchFormat = format(pattern)

function getUtcDateFromFrenchTime ({ date, time }) {
  return zonedTimeToUtc(parisTz)(`${date} ${time}`)
}

function getUtcDateFromFrenchDate (date) {
  return zonedTimeToUtc(parisTz)(`${date} 00:00:00`)
}

function getJSDateFromUtcIso (dateUtcIso) {
  return parseISO(dateUtcIso)
}

function getCurrentTZTimeFromUtc (dateUtcIso) {
  const dateTime = utcToZonedTime(parisTz)(dateUtcIso)
  const [date, time] = getSimpleFrenchFormat(dateTime).split(' ')
  return {
    date,
    time,
  }
}

const isDate = date => {
  return date instanceof Date || (date.toString().length > 4 && getJSDateFromUtcIso(date).toString() !== 'Invalid Date')
}

const ISODate = date => {
  return new Date(date)
}

const now = () => {
  return ISODate(Date.now())
}

const isAfterExisting = function (dateToCompare) {
  return function (date) {
    return !dateToCompare ||
    (dateToCompare && ISODate(date).getTime() >= ISODate(dateToCompare).getTime())
  }
}

const isBeforeExisting = function (dateToCompare) {
  return function (date) {
    return !dateToCompare ||
    (dateToCompare && ISODate(date).getTime() <= ISODate(dateToCompare).getTime())
  }
}

const isBeforeNow = function (date) {
  return ISODate(date).getTime() <= now().getTime()
}

module.exports = {
  getUtcDateFromFrenchTime,
  getUtcDateFromFrenchDate,
  getJSDateFromUtcIso,
  getCurrentTZTimeFromUtc,
  isDate,
  ISODate,
  now,
  isAfterExisting,
  isBeforeExisting,
  isBeforeNow,
}
