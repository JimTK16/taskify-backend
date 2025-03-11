import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators'
import { GET_DB } from '~/config/mongodb'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { taskModel, validateObjectId } from './taskModel'

const LABEL_COLLECTION_NAME = 'labels'
const LABEL_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().min(1).max(30).trim(),
  color: Joi.string()
    .trim()
    .pattern(/^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/) // Validate hex color format
    .message('Invalid hex color code (e.g., #RGB, #RRGGBB, #RRGGBBAA)')
    .default('#cccccc'),
  deleted: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'userId']
const validateBeforeCreate = async (data) => {
  return await LABEL_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })

  // the returned value is also included the default values if they are not provided
}

const validateBeforeUpdate = async (data) => {
  return await LABEL_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const newLabelToAdd = {
      ...validData
    }

    const createdLabel = await GET_DB()
      .collection(LABEL_COLLECTION_NAME)
      .insertOne(newLabelToAdd)

    return createdLabel
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const findOneById = async (id, userId) => {
  try {
    const labelId = validateObjectId(id)
    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).findOne({
      _id: labelId,
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

const findLabelsByUserId = async (userId) => {
  try {
    const labels = await GET_DB()
      .collection(LABEL_COLLECTION_NAME)
      .find({ userId: userId })
      .toArray()

    return labels
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const update = async (id, updateData) => {
  try {
    const labelId = validateObjectId(id)

    const validData = await validateBeforeUpdate(updateData)

    const filteredUpdate = Object.keys(validData)
      .filter((key) => !INVALID_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = validData[key]
        return obj
      }, {})

    const result = await GET_DB()
      .collection(LABEL_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: labelId
        },
        {
          $set: filteredUpdate
        },
        {
          returnDocument: 'after'
        }
      )

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
    }
    return result
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const softDelete = async (id, userId) => {
  try {
    const labelId = validateObjectId(id)
    //1. Softdele the label
    const result = await GET_DB()
      .collection(LABEL_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: labelId,
          userId: userId
        },
        {
          $set: {
            deleted: true
          }
        },
        {
          returnDocument: 'after'
        }
      )
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
    }

    //2.Remove the label id from all tasks referencing it
    await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .updateMany(
        {
          labels: labelId
        },
        {
          $pull: {
            labels: labelId
          }
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

export const labelModel = {
  LABEL_COLLECTION_NAME,
  LABEL_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findLabelsByUserId,
  update,
  softDelete
}
