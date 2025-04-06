import { StatusCodes } from 'http-status-codes'
import { activityLogService } from '~/services/activityLogService'

const getLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10

    if (page < 1) page = 1
    if (limit < 1) page = 10
    if (limit > 100) page = 100
    const result = await activityLogService.getLogs(userId, page, limit)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getLog = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const logId = req.params.id
    const result = await activityLogService.getLog(logId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const activityLogController = {
  getLogs,
  getLog
}
