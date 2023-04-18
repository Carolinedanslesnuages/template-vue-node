import express from 'express'

import usersRouter from './user-routes.js'
import authRouter from './auth-routes.js'

import pkg from '../../package.json'
import { resetPasswordController } from '../controllers/user-controllers.js'

const router = new express.Router()

router.patch('/me', resetPasswordController)
router.use('/users', usersRouter)
router.use('/auth', authRouter)

router.get('/version', (req, res) => {
  res.status(200).json(pkg.version)
})

export default router
