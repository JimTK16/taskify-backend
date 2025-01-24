import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/models/validators'

const checkId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync({ id: req.params.id }, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

const createNew = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().trim().default(''),
    labels: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().min(3).trim().strict(),
          color: Joi.string().required().min(3).trim().strict()
        })
      )
      .default([]),
    priority: Joi.string().valid('low', 'medium', 'high').default('low')
  })

  try {
    await schema.validateAsync(req.body, {
      abortEarly: false
    })

    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )

    next(customError)
  }
}

const update = async (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().trim().default(''),
    labels: Joi.array().items(
      Joi.object({
        name: Joi.string().required().min(3).trim().strict(),
        color: Joi.string().required().min(3).trim().strict()
      })
    ),
    priority: Joi.string().valid('low', 'medium', 'high').default('low'),
    isCompleted: Joi.boolean()
  })

  try {
    await schema.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    next(customError)
  }
}

export const taskValidation = {
  createNew,
  checkId,
  update
}
