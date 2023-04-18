import { appLogger, techLogger } from '../../util/logger.js'
import { createToken } from '../../util/token.js'
import {
  INVALID_CREDENTIALS,
  findUserByCredentials,
} from '../../models/user-queries.js'

import {
  loginLimiter,
  limiterConsecutiveFailsByEmail,
  getFibonacciBlockDurationMinutes,
} from '../../util/brute-force-util.js'

export const protectAgainstBruteForceLogin = async (req, res) => {
  const { email, password } = req.body

  const loggerInfo = {
    section: 'Login',
    subject: email,
  }

  try {
    const user = await findUserByCredentials(email, password)

    appLogger.info({
      ...loggerInfo,
    })

    if (!user.isValidatedEmail) {
      techLogger.warn(`User ${user._id} tried to login with not yet validated email`)
      res.status(401).json({
        success: false,
        message: "Vous n'avez pas encore validé votre adresse courriel",
      })
      return
    }
    await limiterConsecutiveFailsByEmail.delete(email)
    const token = createToken({ id: user._id, roles: user.roles })
    res.status(201).json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    if (error.code !== INVALID_CREDENTIALS) {
      res.status(500).json({
        message: error.message,
        success: false,
      })
      return
    }

    const { status, ...data } = await handleInvalidCredentials(email, loggerInfo)
    res.status(status).json(data)
  }
}

async function handleInvalidCredentials (email, loggerInfo) {
  try {
    await checkLimit(email)
  } catch (rlRejected) {
    if (rlRejected instanceof Error) {
      techLogger.error({
        ...loggerInfo,
        error: rlRejected,
      })

      return {
        status: 500,
        success: false,
        message: 'Une erreur est survenue',
      }
    }

    techLogger.warn({
      ...loggerInfo,
      short: 'Brute-Force',
      error: rlRejected,
    })

    return {
      status: 429,
      success: false,
      message: 'Nombre de tentatives dépassé. Veuillez vous connecter dans quelques minutes',
    }
  }

  techLogger.warn({
    ...loggerInfo,
    short: 'Invalid-Credentials',
  })

  return {
    status: 400,
    success: false,
    message: 'Veuillez vérifier vos emails ou réinitialiser votre mot de passe. Plusieurs tentatives infructueuses bloqueront votre compte.',
  }
}

async function checkLimit (email) {
  const resConsume = await loginLimiter.consume(email)
  if (resConsume.remainingPoints <= 0) {
    const resPenalty = await limiterConsecutiveFailsByEmail.penalty(email)
    await loginLimiter.block(email, 60 * getFibonacciBlockDurationMinutes(resPenalty.consumedPoints))
  }
}
