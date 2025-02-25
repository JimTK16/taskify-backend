import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { isValidObjectId } from '~/utils/validators'
import { notificationModel } from '~/models/notificationModel'

const createNewNotification = async (reqBody, userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  const allowedFields = ['listTitle', 'modalTitle', 'message', 'isRead']
  const sanitizedInput = Object.keys(reqBody)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = reqBody[key]
      return obj
    }, {})

  try {
    const newNotification = { ...sanitizedInput, userId }
    const createdNotification = await notificationModel.createNewNotification(
      newNotification
    )
    const fetchedNotification = await notificationModel.findOneById(
      createdNotification.insertedId.toString(),
      userId
    )

    if (!fetchedNotification) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create notification'
      )
    }

    return fetchedNotification
  } catch (error) {}
  throw new ApiError(
    error.status || StatusCodes.INTERNAL_SERVER_ERROR,
    error.message
  )
}

const toggleIsRead = async (notificationId, userId, isRead) => {
  if (!isValidObjectId(notificationId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid notification ID')
  }

  const existingNotification = await notificationModel.findOneById(
    notificationId,
    userId
  )

  if (!existingNotification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
  }

  try {
    return await notificationModel.toggleIsRead(notificationId, { isRead })
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const getNotifications = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }
  try {
    return await notificationModel.findNotificationsByUserId(userId)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

export const notificationService = {
  createNewNotification,
  toggleIsRead,
  getNotifications
}
