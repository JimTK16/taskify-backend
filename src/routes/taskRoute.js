import express from 'express'
import { taskController } from '~/controllers/taskController'
import { taskValidation } from '~/validations/taskValidation'

const Router = express.Router()

Router.route('/').post(taskValidation.createNew, taskController.createNew)

export const taskRoute = Router
