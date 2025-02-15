import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { generateToken } from '~/utils/jwtHelper'
import { taskModel } from '~/models/taskModel'

const register = async (reqBody) => {
  try {
    const existingUser = await userModel.findByEmail(reqBody.email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    const hashedPassword = await bcrypt.hash(reqBody.password, 10)
    const userToCreate = { ...reqBody, password: hashedPassword }
    const result = await userModel.register(userToCreate)

    const { password, ...userWithoutPassword } = result

    return userWithoutPassword
  } catch (error) {
    throw new Error(error)
  }
}

const login = async (email, password) => {
  const user = await userModel.findByEmail(email)
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
  }

  const userId = user._id.toString()

  const token = generateToken(userId)
  return { user: { email: user.email, userId }, token }
}

const createGuestSampleTasks = async (userId) => {
  const sampleTasks = [
    {
      userId,
      title: 'Welcome to Taskify!',
      description: 'This is a sample task to help you get started',
      priority: 'Priority 1',
      dueDate: new Date().toISOString(),

      labels: [{ name: 'getting-started', color: '#4CAF50' }]
    },
    {
      userId,
      title: 'Try creating a new task',
      description: 'Click the + button to create your own task',
      priority: 'Priority 2',
      dueDate: new Date().toISOString(),
      labels: [{ name: 'tutorial', color: '#2196F3' }]
    },
    {
      userId,
      title: 'Mark tasks as complete',
      description: 'Click the checkbox to mark tasks as done',
      priority: 'Priority 3',
      dueDate: new Date().toISOString(),
      labels: [{ name: 'basics', color: '#FFC107' }]
    }
  ]

  for (const task of sampleTasks) {
    await taskModel.createNew(task)
  }
}

const loginAsGuest = async () => {
  const guestUser = {
    // username: `Guest_${Date.now()}`,
    email: `guest_${Date.now()}@guest.com`,
    password: `guest${Date.now()}`,
    isGuest: true,
    guestExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }

  const result = await userModel.register(guestUser)
  const userId = result.insertedId.toString()
  await createGuestSampleTasks(userId)
  const token = generateToken(userId)

  const returnResult = {
    user: {
      email: guestUser.email,
      userId
    },
    token
  }

  return returnResult
}

export const authService = {
  register,
  login,
  loginAsGuest
}
