import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const TASK_COLLECTION_NAME = 'tasks'
const TASK_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
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
  dueDate: Joi.date().allow(null).default(null),
  priority: Joi.string()
    .valid('Priority 1', 'Priority 2', 'Priority 3')
    .default('Priority 3'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .default(Joi.ref('createdAt')),
  deletedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .allow(null)
    .default(null),
  completedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .allow(null)
    .default(null)
    .when('isCompleted', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.allow(null)
    }),
  isCompleted: Joi.boolean().default(false)
})

const TASK_DELETE_SCHEMA = Joi.object({
  deletedAt: Joi.date().timestamp('javascript').allow(null),
  updatedAt: Joi.date().timestamp('javascript').required()
}).unknown(true)

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'userId']
const validateBeforeCreate = async (data) => {
  return await TASK_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })

  // the returned value is also included the default values if they are not provided
}

const validateBeforeUpdate = async (data, isDelete = false, isUndeleting) => {
  const schema =
    isDelete || isUndeleting ? TASK_DELETE_SCHEMA : TASK_COLLECTION_SCHEMA
  return await schema.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true
  })
}

const validateObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID format')
  }
  return ObjectId.createFromHexString(id)
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newTasktoAdd = {
      ...validData
    }

    const createdTask = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .insertOne(newTasktoAdd)

    return createdTask
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id, userId) => {
  try {
    const taskId = validateObjectId(id)
    const result = await GET_DB().collection(TASK_COLLECTION_NAME).findOne({
      _id: taskId,
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

const findTasksByUserId = async (userId) => {
  try {
    const tasks = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .find({ userId: userId, deletedAt: null })
      .toArray()

    return tasks
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, updateData, isDelete = false, isUnDeleting) => {
  try {
    const taskId = validateObjectId(id)

    const validData = await validateBeforeUpdate(
      updateData,
      isDelete,
      isUnDeleting
    )

    const filteredUpdate = Object.keys(validData)
      .filter((key) => !INVALID_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = validData[key]
        return obj
      }, {})

    const result = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: taskId
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

export const taskModel = {
  TASK_COLLECTION_NAME,
  TASK_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findTasksByUserId,
  update
}
