import express from 'express'
import { activityLogController } from '~/controllers/activityLogController'
import { authenticateUser } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.use(authenticateUser)

Router.route('/').get(activityLogController.getLogs)
export const activityLogRoute = Router
