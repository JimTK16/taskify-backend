import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const result = await taskService.createNew(req.body, userId)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.userId.toString()
    const taskId = req.params.id
    const isUnDeleting = req.query.undoing
    const updateData = req.body
    const result = await taskService.update(
      taskId,
      userId,
      updateData,
      isUnDeleting
    )

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
