import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().min(3).trim().strict(),
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().required().min(8).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const register = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newUser = {
      ...validData
    }

    const createdUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(newUser)

    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const findByEmail = async (email) => {
  const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
    email
  })

  return result
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  register,
  findByEmail
}
