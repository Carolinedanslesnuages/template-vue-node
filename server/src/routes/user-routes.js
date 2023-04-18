import express from 'express'

import { verifyToken } from './middlewares/verify-token.js'

import {
  createUserController,
  getUserByIdController,
  getUsersController,
  sendResetLinkController,
  validateUserMailController,
  updateUserController,
} from '../controllers/user-controllers.js'
import { verifyAccess } from './middlewares/verify-role-access.js'

const router = new express.Router()

router.post('/reset-link', sendResetLinkController)

router.post('/', createUserController)

router.get('/', verifyToken, getUsersController)

router.get('/:id', verifyToken, getUserByIdController)

router.patch('/:id',
  (req, res, next) => {
    if (req.body.h) {
      return validateUserMailController(req, res)
    }
    next()
  },
  verifyToken, verifyAccess, updateUserController)

export default router
