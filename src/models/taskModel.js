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
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  dueDate: Joi.number().allow(null).default(null),
  priority: Joi.string()
    .valid('Priority 1', 'Priority 2', 'Priority 3')
    .default('Priority 3'),
  createdAt: Joi.number().default(Date.now),
  updatedAt: Joi.number()
    .min(Joi.ref('createdAt'))
    .default(Joi.ref('createdAt')),
  deletedAt: Joi.number().min(Joi.ref('createdAt')).allow(null).default(null),
  completedAt: Joi.number()
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
  deletedAt: Joi.number().allow(null),
  updatedAt: Joi.number().required()
}).unknown(true)

const TASK_COMPLETION_SCHEMA = Joi.object({
  isCompleted: Joi.boolean().required()
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

export const validateObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ID format')
  }
  return ObjectId.createFromHexString(id)
}

const enrichTasksWithLabelDetails = async (tasks) => {
  // If tasks is a single task object, convert to array for consistent handling
  const isArray = Array.isArray(tasks)
  const tasksArray = isArray ? tasks : [tasks]

  // Collect all unique label IDs
  const labelIds = [
    ...new Set(
      tasksArray.flatMap((task) =>
        (task.labels || []).filter(
          (id) => id !== null && typeof id === 'string'
        )
      )
    )
  ].map((id) => ObjectId.createFromHexString(id))

  // If there are no labels, return tasks as is
  if (labelIds.length === 0) {
    if (isArray) {
      tasksArray.map((task) => {
        task.labelDetails = []
        return task
      })
    } else {
      tasksArray[0].labelDetails = []
      return tasksArray[0]
    }
  }

  // Fetch all relevant labels
  const labels = await GET_DB()
    .collection('labels')
    .find({ _id: { $in: labelIds }, deleted: false })
    .toArray()

  // Create a map for quick lookups
  const labelsMap = labels.reduce((map, label) => {
    map[label._id.toString()] = label
    return map
  }, {})

  // Add label details to each task
  const enrichedTasks = tasksArray.map((task) => {
    const labelDetails = (task.labels || [])
      .map((labelId) => {
        if (labelId === null || typeof labelId.toString !== 'function')
          return null
        const id = labelId.toString()
        return labelsMap[id] || null
      })
      .filter(Boolean) // Remove null values

    return {
      ...task,
      labelDetails
    }
  })
  // Return in the same format as the input
  return isArray ? enrichedTasks : enrichedTasks[0]
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newTasktoAdd = {
      ...validData
    }

    const result = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .insertOne(newTasktoAdd)

    const newTask = await GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .findOne({ _id: result.insertedId })
    const enrichedTask = await enrichTasksWithLabelDetails(newTask)
    return enrichedTask
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
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
    const enrichedTasks = await enrichTasksWithLabelDetails(tasks)
    return enrichedTasks
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
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

    if (result) {
      return await enrichTasksWithLabelDetails(result)
    }

    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const toggleCompleted = async (id, updateData) => {
  try {
    const taskId = validateObjectId(id)

    const validData = await TASK_COMPLETION_SCHEMA.validateAsync(updateData, {
      abortEarly: false
    })

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
    if (result) {
      return await enrichTasksWithLabelDetails(result)
    }
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
  update,
  toggleCompleted
}
