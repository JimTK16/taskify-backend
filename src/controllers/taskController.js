import { StatusCodes } from 'http-status-codes'
import { activityLogService } from '~/services/activityLogService'
import { taskService } from '~/services/taskService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await taskService.createNew(req.body, userId)

    const logData = {
      userId,
      taskId: result._id.toString(),
      taskTitle: result.title,
      action: 'created'
    }

    await activityLogService.createNew(logData)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const taskId = req.params.id
    const isUnDeleting = req.query.undoing === 'true'
    const updateData = req.body
    const result = await taskService.update(
      taskId,
      userId,
      updateData,
      isUnDeleting
    )

    if (!isUnDeleting) {
      const logData = {
        userId,
        taskId,
        taskTitle: result.title,
        action: 'updated'
      }
      await activityLogService.createNew(logData)
    }

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const taskId = req.params.id
    const result = await taskService.deleteTask(taskId, userId)

    const logData = {
      userId,
      taskId,
      taskTitle: result.title,
      action: 'deleted'
    }

    await activityLogService.createNew(logData)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const toggleCompleted = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const taskId = req.params.id
    const result = await taskService.toggleCompleted(
      taskId,
      userId,
      req.body.isCompleted
    )

    if (req.body.isCompleted) {
      const logData = {
        userId,
        taskId,
        taskTitle: result.title,
        action: 'completed'
      }
      await activityLogService.createNew(logData)
    }
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const result = await taskService.getTasks(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTask = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const taskId = req.params.id
    const result = await taskService.getTask(taskId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const taskController = {
  createNew,
  deleteTask,
  updateTask,
  getTasks,
  getTask,
  toggleCompleted
}
