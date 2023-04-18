import express from 'express'
import helmet from 'helmet'

import routes from './routes/index.js'

import { logHttp } from './util/logger.js'

export const apiPrefix = '/api/v1'

/** @type {boolean} */
const isTest = process.env.NODE_ENV === 'test'

/** @type {boolean} */
const isAct = process.env.ACT

const app = express()
app.use(helmet())

app.use((req, res, next) => {
  res.header('x-powered-by', 'LAB-MI')
  next()
})

if (!isTest || isAct) {
  app.use(logHttp)
}

app.use(express.json())
app.use(apiPrefix, routes)

process.title = 'app-api'

export default app
