import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from './validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const TASK_COLLECTION_NAME = 'tasks'
const TASK_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).trim().strict(),

  description: Joi.string().allow('').optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  deletedAt: Joi.date()
    .timestamp('javascript')
    .less(Joi.ref('createdAt'))
    .default(null),
  completedAt: Joi.date().timestamp('javascript').default(null),
  isCompleted: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await TASK_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
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

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .findOne({
        _id: ObjectId.createFromHexString(id)
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .deleteOne({
        _id: ObjectId.createFromHexString(id)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const taskModel = {
  TASK_COLLECTION_NAME,
  TASK_COLLECTION_SCHEMA,
  createNew,
  deleteOneById,
  findOneById
}
