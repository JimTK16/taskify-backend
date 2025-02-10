import { StatusCodes } from 'http-status-codes'
import { taskModel } from '~/models/taskModel'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody, userId) => {
  try {
    const newTask = { ...reqBody, userId }

    const response = await taskModel.createNew(newTask)
    const createdTask = await taskModel.findOneById(
      response.insertedId.toString()
    )

    return createdTask
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, reqBody) => {
  try {
    const updateData = { ...reqBody, updatedAt: Date.now() }

    const result = await taskModel.update(id, updateData)
    if (!result) {
      return { error: 'task not found' }
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}
const deleteTask = async (id) => {
  try {
    const deleteData = { deletedAt: Date.now() }

    const result = await taskModel.update(id, deleteData)
    if (!result) {
      return { error: 'task not found' }
    }

    return { deleteResult: 'task deleted' }
  } catch (error) {
    throw new Error(error)
  }
}

const getTasks = async (userId) => {
  try {
    const tasks = await taskModel.findTasksByUserId(userId)
    return tasks
  } catch (error) {
    throw new Error(error)
  }
}
const getOne = async (taskId, userId) => {
  try {
    const task = await taskModel.findOneById(taskId, userId)
    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
    }
    return task
  } catch (error) {
    throw new Error(error)
  }
}
export const taskService = {
  createNew,
  deleteTask,
  update,
  getTasks,
  getOne
}
