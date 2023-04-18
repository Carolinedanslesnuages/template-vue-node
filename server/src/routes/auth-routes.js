import express from 'express'

import {
  // login,
  verifyToken,
} from '../controllers/auth-controllers.js'
import { protectAgainstBruteForceLogin } from './middlewares/protect-against-brute-force.js'

const router = new express.Router()

router.post('/', protectAgainstBruteForceLogin)
router.get('/verify-token', verifyToken)

export default router
