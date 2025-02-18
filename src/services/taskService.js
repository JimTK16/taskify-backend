import { StatusCodes } from 'http-status-codes'
import { taskModel } from '~/models/taskModel'
import ApiError from '~/utils/ApiError'
import { isValidObjectId } from '~/utils/validators'

const createNew = async (reqBody, userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  //Sanitize input
  const allowedFields = [
    'title',
    'description',
    'labels',
    'dueDate',
    'priority'
  ]
  const sanitizedInput = Object.keys(reqBody)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = reqBody[key]
      return obj
    }, {})
  try {
    const newTask = { ...sanitizedInput, userId }

    const createdTask = await taskModel.createNew(newTask)
    const fetchedTask = await taskModel.findOneById(
      createdTask.insertedId.toString(),
      userId
    )

    if (!fetchedTask) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create task'
      )
    }

    return fetchedTask
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const update = async (taskId, userId, updateData, isUnDeleting) => {
  // Validate taskId
  if (!isValidObjectId(taskId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task ID')
  }

  // Check task existence
  const exsistingTask = await taskModel.findOneById(taskId, userId)
  if (!exsistingTask) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  // Prepare update data
  const sanitizedUpdate = { ...updateData, userId, updatedAt: Date.now() }

  try {
    return await taskModel.update(taskId, sanitizedUpdate, isUnDeleting)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const deleteTask = async (taskId, userId) => {
  // Validate taskId
  if (!isValidObjectId(taskId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task ID')
  }

  // Check task existence
  const exsistingTask = await taskModel.findOneById(taskId, userId)
  if (!exsistingTask) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  try {
    return await taskModel.update(
      taskId,
      {
        deletedAt: Date.now(),
        updatedAt: Date.now()
      },
      true
    )
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const getTasks = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID')
  }

  try {
    return await taskModel.findTasksByUserId(userId)
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
const getTask = async (taskId, userId) => {
  if (!isValidObjectId(taskId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task ID')
  }
  try {
    const task = await taskModel.findOneById(taskId, userId)
    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
    }
    return task
  } catch (error) {
    throw new ApiError(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}
export const taskService = {
  createNew,
  deleteTask,
  update,
  getTasks,
  getTask
}
