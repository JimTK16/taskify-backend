import { StatusCodes } from 'http-status-codes'
import { activityLogModel } from '~/models/activityLogModel'
import ApiError from '~/utils/ApiError'
import { isValidObjectId } from '~/utils/validators'

const createNew = async (logData) => {
  if (!isValidObjectId(logData.userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  if (!isValidObjectId(logData.taskId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task ID')
  }
  //Sanitize input
  const allowedFields = ['userId', 'taskId', 'taskTitle', 'action', 'createdAt']
  const sanitizedLog = Object.keys(logData)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = logData[key]
      return obj
    }, {})
  try {
    const createdLog = await activityLogModel.createNew(sanitizedLog)

    return createdLog
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const getLogs = async (userId, page, limit) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  try {
    const skip = (page - 1) * limit
    const { logs, total } = await activityLogModel.findLogsByUserId(
      userId,
      skip,
      limit
    )
    return { logs, total, page, limit }
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const getLog = async (logId, userId) => {
  if (!isValidObjectId(logId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid log ID')
  }
  try {
    const log = await activityLogModel.findOneById(logId, userId)
    if (!log) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Log not found')
    }
    return log
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
export const activityLogService = {
  createNew,
  getLogs,
  getLog
}
