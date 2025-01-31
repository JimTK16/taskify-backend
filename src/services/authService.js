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

  const token = generateToken(user._id.toString())
  return { user: { email: user.email, username: user.username }, token }
}

const createGuestSampleTasks = async (userId) => {
  const sampleTasks = [
    {
      userId,
      title: 'Welcome to Taskify!',
      description: 'This is a sample task to help you get started',
      priority: 'high',
      labels: [{ name: 'getting-started', color: '#4CAF50' }]
    },
    {
      userId,
      title: 'Try creating a new task',
      description: 'Click the + button to create your own task',
      priority: 'medium',
      labels: [{ name: 'tutorial', color: '#2196F3' }]
    },
    {
      userId,
      title: 'Mark tasks as complete',
      description: 'Click the checkbox to mark tasks as done',
      priority: 'low',
      labels: [{ name: 'basics', color: '#FFC107' }]
    }
  ]

  for (const task of sampleTasks) {
    await taskModel.createNew(task)
  }
}

const loginAsGuest = async () => {
  const guestUser = {
    username: `Guest_${Date.now()}`,
    email: `guest_${Date.now()}@guest.com`,
    password: `guest${Date.now()}`,
    isGuest: true,
    guestExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }

  const result = await userModel.register(guestUser)
  await createGuestSampleTasks(result.insertedId.toString())
  const token = generateToken(result.insertedId.toString())

  const returnResult = {
    user: {
      email: guestUser.email,
      username: guestUser.username
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
