import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { labelModel } from '~/models/labelModel'
const checkId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
  }).unknown(false)

  try {
    await schema.validateAsync({ id: req.params.id }, { abortEarly: false })

    const label = await labelModel.findOneById(req.params.id, req.user.userId)

    if (!label) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
    }
    next()
  } catch (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')
    next(new ApiError(error.status || StatusCodes.BAD_REQUEST, errorMessage))
  }
}
const CLIENT_LABEL_SCHEMA = Joi.object({
  name: Joi.string().required().min(1).max(30).trim(),
  color: Joi.string()
    .trim()
    .pattern(/^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/) // Validate hex color format
    .message('Invalid hex color code (e.g., #RGB, #RRGGBB, #RRGGBBAA)')
    .default('#cccccc')
}).unknown(false)

const createNew = async (req, res, next) => {
  try {
    await CLIENT_LABEL_SCHEMA.validateAsync(req.body, {
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

const update = async (req, res, next) => {
  try {
    await CLIENT_LABEL_SCHEMA.validateAsync(req.body, {
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

export const labelValidation = {
  createNew,
  checkId,
  update
}
