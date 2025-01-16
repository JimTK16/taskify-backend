import { taskModel } from '~/models/taskModel'

const createNewTask = async (reqBody) => {
  try {
    const newTask = { ...reqBody }

    const createdTask = await taskModel.createNew(newTask)

    return createdTask
  } catch (error) {
    throw new Error(error)
  }
}

export const taskService = {
  createNewTask
}
