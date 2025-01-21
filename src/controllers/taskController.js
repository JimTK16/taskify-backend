import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createdTask = await taskService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdTask)
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

export const taskController = {
  createNew,
  deleteTask,
  update
}
