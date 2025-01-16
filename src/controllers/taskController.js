import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'

const createNew = async (req, res, next) => {
  try {
    const createdTask = await taskService.createNewTask(req.body)

    res.status(StatusCodes.CREATED).json(createdTask)
  } catch (error) {
    next(error)
  }
}

export const taskController = {
  createNew
}
