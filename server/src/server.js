import dotenv from 'dotenv'
import { createServer } from 'http'
import fs from 'fs'

import app from './app.js'
import { getConnection, closeConnections } from './connect.js'
import { techLogger } from './util/logger.js'

export const DEFAULT_PORT = 4000

const port = getPort()
startServer(port)
handleExit()

const isTest = process.env.NODE_ENV === 'test'
const isDevSetup = process.env.DEV_SETUP === 'true'

/** @type {number} */

/**
 * Start the server if connection to DB is successful
 *
 * @function
 */
export async function startServer (port) {
  try {
    await getConnection()
  } catch (error) {
    techLogger.error(error.message)
    throw error
  }
  techLogger.info('server connected to mongodb, reading init-db.js')

  try {
    if (isDevSetup) {
      techLogger.info('Starting init DB for test or CI')
      const { default: setup } = await import('../dev-setup/setup.js')
      await setup()
      techLogger.info('DB successfully init for test or CI')
    }
    let initDb
    try {
      initDb = (await import('./init-db.js')).default
    } catch (e) {
      techLogger[isTest ? 'info' : 'warn'](`Init file is undefined: ${e}`)
    }
    if (!isTest && initDb) {
      await initDb()
      techLogger.info('initDb invoked successfully, cleaning up')
      await new Promise((resolve, reject) => {
        fs.unlink('./src/init-db.js', (err) => {
          if (err) reject(err)
          techLogger.info('Successfully deleted ./init-db.js')
          resolve()
        })
      })
    }
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.startsWith('Cannot find module')) {
      techLogger.info('No initDb file, skipping')
    } else {
      techLogger.warn(error.message)
      throw error
    }
  }

  createServer(app).listen(port, '0.0.0.0')
  techLogger.info(`server running at http://localhost:${port}`)
}

/**
 * Read config from .env file and get appropriate port to listen on
 *
 * @function
 *
 * @returns {number} - Port to listen on
 */
export function getPort () {
  dotenv.config() // TODO : Vérifier l'appel du .env (effectué dans de multiples fichiers. Pourquoi pas un seul appel global ?)
  const port = process.env.APP_API_PORT || DEFAULT_PORT
  return +port
}

/**
 * Handle unexpected exits to exit gracefuly (close connections to DB)
 *
 * @function
 */
export function handleExit () {
  process.on('exit', exitGracefuly)

  // This will handle kill commands, such as CTRL+C:
  process.on('SIGINT', exitGracefuly)
  process.on('SIGTERM', exitGracefuly)

  // This will prevent dirty exit on code-fault crashes:
  process.on('uncaughtException', exitGracefuly)
}

/**
 * Ferme proprement les connexions à MongoDB en cas d'arrêt de l'application
 *
 * @async
 * @function
 *
 * @param {Error=} error - Error remontée dans le cas d'un arrêt suite à une erreur non gérée
 *
 * @returns {void}
 */
export async function exitGracefuly (error) {
  if (error instanceof Error) {
    techLogger.error(error)
  }
  techLogger.info('Closing connections...')
  await closeConnections()
  techLogger.info('Exiting...')
  process.exit(error instanceof Error ? 1 : 0)
}
