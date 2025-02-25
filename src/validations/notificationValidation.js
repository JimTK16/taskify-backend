import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { notificationModel } from '~/models/notificationModel'

const checkId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
  }).unknown(false)

  try {
    await schema.validateAsync({ id: req.params.id }, { abortEarly: false })
    const notification = await notificationModel.findOneById(
      req.params.id,
      req.user.userId
    )
    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
    }
    next()
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')
    next(new ApiError(error.status || StatusCodes.BAD_REQUEST, errorMessage))
  }
}

const createNewNotification = async (req, res, next) => {
  try {
    await notificationModel.NOTIFICATION_COLLECTION_SCHEMA.validateAsync(
      req.body,
      {
        abortEarly: false
      }
    )
    next()
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')

    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const toggleIsRead = async (req, res, next) => {
  const schema = Joi.object({
    isRead: Joi.boolean().required()
  }).unknown(false)
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const notificationValidation = {
  checkId,
  createNewNotification,
  toggleIsRead
}
