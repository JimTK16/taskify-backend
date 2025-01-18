import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'

const createNew = async (req, res, next) => {
  try {
    const createdTask = await taskService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdTask)
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id
    const result = await taskService.deleteTask(taskId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const taskController = {
  createNew,
  deleteTask
}
