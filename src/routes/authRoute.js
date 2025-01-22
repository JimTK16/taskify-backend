import express from 'express'
import { authController } from '~/controllers/authController'
import { authenticateUser } from '~/middlewares/authMiddleware'
import { authValidation } from '~/validations/authValidation'

const Router = express.Router()

Router.route('/register').post(authValidation.register, authController.register)
Router.route('/login').post(authValidation.register, authController.login)
Router.route('/logout').post(authenticateUser, authController.logout)
export const authRoute = Router
