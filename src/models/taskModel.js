import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from './validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const TASK_COLLECTION_NAME = 'tasks'
const TASK_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
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
  priority: Joi.string().valid('low', 'medium', 'high').default('low'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .default(Joi.ref('createdAt')),
  deletedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .default(null),
  completedAt: Joi.date()
    .timestamp('javascript')
    .min(Joi.ref('createdAt'))
    .default(null)
    .when('isCompleted', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.allow(null)
    }),
  isCompleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'userId']
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

const findTasksByUserId = async (userId) => {
  try {
    const tasks = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .find({ userId: userId, deletedAt: null })
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: ObjectId.createFromHexString(id),
          deletedAt: null
        },
        {
          $set: updateData
        },
        {
          returnDocument: 'after'
        }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// const deleteOneById = async (id) => {
//   try {
//     const result = await GET_DB()
//       .collection(TASK_COLLECTION_NAME)
//       .findOneAndUpdate(
//         {
//           _id: ObjectId.createFromHexString(id)
//         },
//         {
//           $set: {
//             deletedAt: Date.now()
//           }
//         },
//         {
//           returnDocument: 'after'
//         }
//       )
//     return result
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const taskModel = {
  TASK_COLLECTION_NAME,
  TASK_COLLECTION_SCHEMA,
  createNew,
  // deleteOneById,
  findOneById,
  findTasksByUserId,
  update
}
