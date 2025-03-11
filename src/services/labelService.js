import { StatusCodes } from 'http-status-codes'
import { labelModel } from '~/models/labelModel'
import ApiError from '~/utils/ApiError'
import { isValidObjectId } from '~/utils/validators'

const createNew = async (reqBody, userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  //Sanitize input
  const allowedFields = ['name', 'color']
  const sanitizedInput = Object.keys(reqBody)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = reqBody[key]
      return obj
    }, {})
  try {
    const newLabel = { ...sanitizedInput, userId }

    const createdLabel = await labelModel.createNew(newLabel)
    const fetchedLabel = await labelModel.findOneById(
      createdLabel.insertedId.toString(),
      userId
    )

    if (!fetchedLabel) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create label'
      )
    }

    return fetchedLabel
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const update = async (labelId, userId, updateData) => {
  // Validate labelId
  if (!isValidObjectId(labelId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid label ID')
  }

  // Check label existence
  const existingLabel = await labelModel.findOneById(labelId, userId)
  if (!existingLabel) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
  }

  // Prepare update data
  const sanitizedUpdate = { ...updateData, userId }

  try {
    return await labelModel.update(labelId, sanitizedUpdate)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const softDelete = async (labelId, userId) => {
  // Validate labelId
  if (!isValidObjectId(labelId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid label ID')
  }

  // Check label existence
  const existingLabel = await labelModel.findOneById(labelId, userId)
  if (!existingLabel) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
  }

  try {
    return await labelModel.softDelete(labelId, userId)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const getLabels = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  try {
    return await labelModel.findLabelsByUserId(userId)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const getLabel = async (labelId, userId) => {
  if (!isValidObjectId(labelId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid label ID')
  }
  try {
    const label = await labelModel.findOneById(labelId, userId)
    if (!label) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found')
    }
    return label
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
export const labelService = {
  createNew,
  softDelete,
  update,
  getLabels,
  getLabel
}
