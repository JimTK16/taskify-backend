import express from 'express'
import { taskController } from '~/controllers/taskController'
import { authenticateUser } from '~/middlewares/authMiddleware'
import { taskValidation } from '~/validations/taskValidation'

const Router = express.Router()

Router.use(authenticateUser)

Router.route('/')
  .get(taskController.getTasks)
  .post(taskValidation.createNew, taskController.createNew)
Router.route('/:id')
  .get(taskValidation.checkId, taskController.getTask)
  .put(taskValidation.checkId, taskController.updateTask)
  .delete(taskValidation.checkId, taskController.deleteTask)
export const taskRoute = Router
