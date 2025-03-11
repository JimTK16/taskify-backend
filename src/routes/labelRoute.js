import express from 'express'
import { labelController } from '~/controllers/labelController'
import { authenticateUser } from '~/middlewares/authMiddleware'
import { labelValidation } from '~/validations/labelValidation'

const Router = express.Router()

Router.use(authenticateUser)

Router.route('/')
  .get(labelController.getLabels)
  .post(labelValidation.createNew, labelController.createNew)
Router.route('/:id')
  .get(labelValidation.checkId, labelController.getLabel)
  .put(labelValidation.checkId, labelController.update)
  .delete(labelValidation.checkId, labelController.softDelete)

export const labelRoute = Router
