import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'

const register = async (req, res, next) => {
  try {
    await userModel.USER_COLLECTION_SCHEMA.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const login = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().trim().strict(),
    password: Joi.string().required().min(8).trim().strict()
  })
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const authValidation = {
  register,
  login
}
