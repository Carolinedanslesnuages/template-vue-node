import mongoose from 'mongoose'
import { RateLimiterMongo } from 'rate-limiter-flexible'

export const maxConsecutiveFailsByEmail = 5

const loginLimiterOpts = {
  storeClient: mongoose.connection,
  keyPrefix: 'login',
  points: maxConsecutiveFailsByEmail, // Number of points
  duration: 60, // 1 minute at first
}
const ConsecutiveFailsOpts = {
  storeClient: mongoose.connection,
  keyPrefix: 'login_fail_consecutive_email',
  points: 99999, // doesn't matter much, this is just counter
  duration: 0, // never expire
}

export const loginLimiter = new RateLimiterMongo(loginLimiterOpts)
export const limiterConsecutiveFailsByEmail = new RateLimiterMongo(ConsecutiveFailsOpts)

export function getFibonacciBlockDurationMinutes (countConsecutiveOutOfLimits) {
  if (countConsecutiveOutOfLimits in getFibonacciBlockDurationMinutes.memo) {
    return getFibonacciBlockDurationMinutes.memo[countConsecutiveOutOfLimits]
  }

  if (countConsecutiveOutOfLimits <= 1) {
    getFibonacciBlockDurationMinutes.memo[countConsecutiveOutOfLimits] = 1
    return getFibonacciBlockDurationMinutes.memo[countConsecutiveOutOfLimits]
  }

  getFibonacciBlockDurationMinutes.memo[countConsecutiveOutOfLimits] = getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 1) + getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 2)
  return getFibonacciBlockDurationMinutes.memo[countConsecutiveOutOfLimits]
}
getFibonacciBlockDurationMinutes.memo = {}
