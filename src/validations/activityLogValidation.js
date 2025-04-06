import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { activityLogModel } from '~/models/activityLogModel'

const checkId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
  }).unknown(false)

  try {
    await schema.validateAsync({ id: req.params.id }, { abortEarly: false })

    const log = await activityLogModel.findOneById(
      req.params.id,
      req.user.userId
    )

    if (!log) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Log not found')
    }
    next()
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')
    next(new ApiError(error.status || StatusCodes.BAD_REQUEST, errorMessage))
  }
}

const createNew = async (req, res, next) => {
  try {
    await activityLogModel.ACTIVITY_LOG_COLLECTION_SCHEMA.validateAsync(
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

export const activityLogValidation = {
  createNew,
  checkId
}
