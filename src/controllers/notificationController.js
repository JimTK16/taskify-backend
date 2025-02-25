import e from 'express'
import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'

const createNewNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await notificationService.createNew(req.body, userId)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const toggleIsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const notificationId = req.params.id
    const isRead = req.body.isRead
    const result = await notificationService.toggleIsRead(
      notificationId,
      userId,
      isRead
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await notificationService.getNotifications(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const notificationController = {
  createNewNotification,
  toggleIsRead,
  getNotifications
}
