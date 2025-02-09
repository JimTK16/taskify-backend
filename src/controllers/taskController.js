import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    console.log(req)
    const userId = req.user.userId.toString()
    const result = await taskService.createNew(req.body, userId)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const updateData = req.body
    const result = await taskService.update(taskId, updateData)

    if (result.error) {
      return next(new ApiError(StatusCodes.NOT_FOUND, result.error))
    }

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const result = await taskService.deleteTask(taskId)

    if (result.error) {
      return next(new ApiError(StatusCodes.NOT_FOUND, result.error))
    }
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTasks = async (req, res, next) => {
  try {
    console.log(req.user)
    const userId = req.user.userId
    console.log(userId)
    const result = await taskService.getTasks(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getOne = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const taskId = req.params.id
    const result = await taskService.getOne(taskId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {}
}

export const taskController = {
  createNew,
  deleteTask,
  update,
  getTasks,
  getOne
}
