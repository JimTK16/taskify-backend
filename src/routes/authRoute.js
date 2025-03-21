import express from 'express'
import { authController } from '~/controllers/authController'
import { authenticateUser } from '~/middlewares/authMiddleware'
import { authValidation } from '~/validations/authValidation'

const Router = express.Router()

Router.route('/signup').post(authValidation.register, authController.register)
Router.route('/signin').post(authValidation.login, authController.login)
Router.route('/signout').post(authenticateUser, authController.logout)
Router.route('/guest').post(authController.loginAsGuest)
Router.route('/refresh').post(authController.refreshToken)
export const authRoute = Router
