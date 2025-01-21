import { taskModel } from '~/models/taskModel'

const createNew = async (reqBody) => {
  try {
    const newTask = { ...reqBody }

    const createdTask = await taskModel.createNew(newTask)

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

export const taskService = {
  createNew,
  deleteTask,
  update
}
