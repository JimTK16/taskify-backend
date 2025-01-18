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

const deleteTask = async (id) => {
  try {
    await taskModel.deleteOneById(id)

    return { deleteResult: 'task deleted' }
  } catch (error) {
    throw new Error(error)
  }
}

export const taskService = {
  createNew,
  deleteTask
}
