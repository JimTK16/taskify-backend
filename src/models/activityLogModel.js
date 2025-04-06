import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const ACTIVITY_LOG_COLLECTION_NAME = 'activityLogs'
const ACTIVITY_LOG_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  taskId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  taskTitle: Joi.string().required().min(1).trim(),
  action: Joi.string()
    .required()
    .valid('created', 'updated', 'deleted', 'completed')
    .required(),
  createdAt: Joi.number().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await ACTIVITY_LOG_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newLogtoAdd = {
      ...validData
    }

    const result = await GET_DB()
      .collection(ACTIVITY_LOG_COLLECTION_NAME)
      .insertOne(newLogtoAdd)

    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const findOneById = async (id, userId) => {
  try {
    const logId = validateObjectId(id)
    const result = await GET_DB()
      .collection(ACTIVITY_LOG_COLLECTION_NAME)
      .findOne({
        _id: logId,
        userId: userId
      })

    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const findLogsByUserId = async (userId, skip, limit) => {
  try {
    const collection = GET_DB().collection(ACTIVITY_LOG_COLLECTION_NAME)
    const logs = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    const total = await collection.countDocuments({ userId: userId })
    return { logs, total }
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

export const activityLogModel = {
  ACTIVITY_LOG_COLLECTION_NAME,
  ACTIVITY_LOG_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findLogsByUserId
}
