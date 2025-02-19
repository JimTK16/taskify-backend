import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { taskModel } from '~/models/taskModel'
const checkId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE)
  }).unknown(false)

  try {
    await schema.validateAsync({ id: req.params.id }, { abortEarly: false })

    const task = await taskModel.findOneById(req.params.id, req.user.userId)

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
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
  const CLIENT_TASK_SCHEMA = Joi.object({
    title: Joi.string().required().min(1).trim(),
    description: Joi.string().allow(null, '').trim().default(''),
    labels: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().min(3).trim().strict(),
          color: Joi.string().required().min(3).trim().strict()
        })
      )
      .default([]),
    dueDate: Joi.number().allow(null).default(null),
    priority: Joi.string()
      .valid('Priority 1', 'Priority 2', 'Priority 3')
      .default('Priority 3')
  }).unknown(false)

  try {
    await CLIENT_TASK_SCHEMA.validateAsync(req.body, {
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
  const schema = Joi.object({
    title: Joi.string().required().min(1).trim(),
    description: Joi.string().trim().default(''),
    labels: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().min(3).trim().strict(),
          color: Joi.string().required().min(3).trim().strict()
        })
      )
      .default([]),
    dueDate: Joi.number().allow(null),
    priority: Joi.string()
      .valid('Priority 1', 'Priority 2', 'Priority 3')
      .default('Priority 3'),
    isCompleted: Joi.boolean()
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

const toggleCompleted = async (req, res, next) => {
  const schema = Joi.object({
    isCompleted: Joi.boolean().required()
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

export const taskValidation = {
  createNew,
  checkId,
  update,
  toggleCompleted
}
