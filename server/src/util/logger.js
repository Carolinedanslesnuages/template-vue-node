/**
 * Définition des différents loggers et de leurs propriétés
 *
 * @module
 */
import winston from 'winston'
import morgan from 'morgan'
import dateUtil from './date-util.cjs'

const { getJSDateFromUtcIso } = dateUtil

const { format } = winston

const { colorize, combine, timestamp, label, printf } = format

/** @type {boolean} */
const isProd = process.env.NODE_ENV === 'production'

/** @type {boolean} */
const isTest = process.env.NODE_ENV === 'test'

/** @type {boolean} */
const isAct = process.env.ACT

/** @type {boolean} */
const isCI = process.env.CI === 'true'

/** @type {string} */
const TECH_LABEL = 'tech'
/** @type {string} */
const APP_LABEL = 'app'
/** @type {string} */
const HTTP_LABEL = 'http'

/** @type {string} */
const level = isProd || isAct
  ? 'info'
  : isCI
    ? 'crit'
    : isTest
      ? 'error'
      : 'debug'

/**
 * @type {Object}
 *
 * @property {Object} console - Options pour la console
 * @property {string} console.level - Niveau de criticité minimal qui sera pris en compte
 * @property {boolean} console.json - Le message sera mis sous forme JSON si cette propriété est à `true`,
 *                                    sous forme de chaîne de caractères sinon
 * B@property {boolean} console.json - Le message sera colorisé si cette propriété est à `true`
 */
const logOptions = {
  console: {
    level,
    json: false,
    colorize: !isProd,
  },
}

export const getProperObjectFromError = error => {
  if (error == null) {
    return '<empty error>'
  }
  return Object.getOwnPropertyNames(error).reduce(
    (acc, key) => ({
      ...acc,
      [key]: error[key],
    }),
    Object.create(null),
  )
}

/**
 * Encapsule les valeurs des clés begin, end, date et dateTime par un '[]' pour que fluend-elastic ne les convertive pas en date
 * @param {Object} message - Message structuré
 */
export const getProperObjectFromDate = message => {
  return Object.getOwnPropertyNames(message).reduce((acc, key) => {
    let value = message[key]
    if (['begin', 'end', 'date', 'dateTime'].includes(key)) {
      const newkey = key + 'Str'
      acc = {
        ...acc,
        [newkey]: `__${value}__`,
      }
      const datetimevalue = getJSDateFromUtcIso(value)
      if (datetimevalue) {
        value = datetimevalue
      }
    }
    return {
      ...acc,
      [key]: value,
    }
  }, Object.create(null))
}

export const getProperObject = message => {
  if (message == null) {
    return { default: '<empty message>' }
  }
  if (typeof message === 'string') {
    return { default: message }
  }
  if (message instanceof Error) {
    return getProperObjectFromError(message)
  }
  if ('error' in message) {
    message.error = getProperObjectFromError(message.error)
  }
  return getProperObjectFromDate(message)
}

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${typeof message === 'object' ? JSON.stringify(getProperObject(message), null, 2, ' ') : message}`
})

const logJsonFormat = printf(({ label, level, message, timestamp }) => {
  const content = getProperObject(message)
  return JSON.stringify({
    content,
    meta: {
      level,
      label,
      timestamp,
    },
  })
})

export const techLogger = createWinstonLogger(TECH_LABEL)

export const appLogger = createWinstonLogger(APP_LABEL)

export const morganLogger = createWinstonLogger(HTTP_LABEL)

/**
 * @type {import('morgan').Options}
 *
 * @property {Function} write - Function appelé par morgan
 */
const morganLoggerStream = {
  write: function (message, encoding) {
    morganLogger.info(message)
  },
}

/**
 * @type {import('express').IRouterHandler}
 */
export const logHttp = morgan('combined', { stream: morganLoggerStream })

/**
 * Crée un logger pour winston
 *
 * @param {string} label - Label du log
 *
 * @returns {import('winston').Logger}
 */
function createWinstonLogger (labelName, printColor) {
  const combineArgs = [
    label({ label: labelName }),
    timestamp(),
  ]
  if (!isProd) {
    combineArgs.push(colorize())
    combineArgs.push(logFormat)
  } else {
    combineArgs.push(logJsonFormat)
  }
  return winston.createLogger({
    format: combine(...combineArgs),
    transports: [
      new winston.transports.Console(logOptions.console),
    ],
  })
}
