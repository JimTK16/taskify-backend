import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from './validators'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  // username: Joi.string().required().min(3).trim().strict(),
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  isGuest: Joi.boolean().default(false),
  guestExpiryDate: Joi.date().timestamp('javascript').allow(null).default(null)
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

const findById = async (id) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({
      _id: ObjectId.createFromHexString(id)
    })

  return result
}

const cleanupGuestAccounts = async () => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .deleteMany({
        isGuest: true,
        guestExpiryDate: { $lt: new Date() }
      })

    //also delete all tasks created by guest users
    if (result.deletedCount > 0) {
      await GET_DB()
        .collection('tasks')
        .deleteMany({ userId: { $in: result.deletedIds } })
    }

    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  register,
  findByEmail,
  findById,
  cleanupGuestAccounts
}
