import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { validateObjectId } from './taskModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const NOTIFICATION_COLLECTION_NAME = 'notifications'
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  listTitle: Joi.string().required().min(3).max(100).trim(),
  modalTitle: Joi.string().required().min(3).max(100).trim(),
  message: Joi.string().required().min(1).trim(),
  createdAt: Joi.number().default(Date.now),
  isRead: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['userId', 'createdAt', '_id']

const NOTIFICATION_TOGGLE_SCHEMA = Joi.object({
  isRead: Joi.boolean().required()
}).unknown(true)

const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const validateBeforeUpdate = async (data) => {
  return await NOTIFICATION_TOGGLE_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNewNotification = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newNotification = {
      ...validData
    }

    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .insertOne(newNotification)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id, userId) => {
  try {
    const notificationId = validateObjectId(id)
    const notification = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOne({ _id: notificationId, userId: userId })
    return notification
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const findNotificationsByUserId = async (userId) => {
  try {
    const notfications = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .find({ userId: userId })
      .toArray()
    return notfications
  } catch (error) {}
}
const update = async (id, updateData) => {
  try {
    const notificationId = validateObjectId(id)
    const validData = await validateBeforeUpdate(updateData)

    const filteredUpdate = Object.keys(validData)
      .filter((key) => !INVALID_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = validData[key]
        return obj
      }, {})

    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: notificationId
        },
        {
          $set: filteredUpdate
        },
        {
          returnDocument: 'after'
        }
      )

    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const toggleIsRead = async (id, updateData) => {
  try {
    const notificationId = validateObjectId(id)
    const validData = await NOTIFICATION_TOGGLE_SCHEMA.validateAsync(
      updateData,
      {
        abortEarly: false
      }
    )

    const filteredUpdate = Object.keys(validData)
      .filter((key) => !INVALID_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = validData[key]
        return obj
      }, {})

    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: notificationId
        },
        {
          $set: filteredUpdate
        },
        {
          returnDocument: 'after'
        }
      )
    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  createNewNotification,
  findNotificationsByUserId,
  update,
  toggleIsRead,
  findOneById
}
