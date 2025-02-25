import express from 'express'
import { authenticateUser } from '~/middlewares/authMiddleware'
import { notificationController } from '~/controllers/notificationController'
import { notificationValidation } from '~/validations/notificationValidation'
const Router = express.Router()

Router.use(authenticateUser)

Router.route('/')
  .get(notificationController.getNotifications)
  .post(
    notificationValidation.createNewNotification,
    notificationController.createNewNotification
  )
Router.route('/:id/toggle-isRead').patch(
  notificationValidation.checkId,
  notificationValidation.toggleIsRead,
  notificationController.toggleIsRead
)
export const notificationRoute = Router
