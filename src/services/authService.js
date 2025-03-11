import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { generateToken } from '~/utils/jwtHelper'
import { taskModel } from '~/models/taskModel'
import { notificationModel } from '~/models/notificationModel'

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
    await createNewUserNotifications(result.insertedId.toString())
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

const createNewUserNotifications = async (userId) => {
  const newUserNotifications = [
    {
      userId,
      listTitle:
        'Welcome to Taskify – Elevate Your Productivity Journey From Day One!',
      message:
        "Hello and welcome! We're thrilled to have you on board. Begin exploring your tasks and unlock new levels of productivity and efficiency today.",
      modalTitle: 'Welcome to Your New Productivity Hub',
      isRead: false
    },

    {
      userId,
      listTitle:
        "Congratulations on Completing Your Setup – You're Ready to Conquer Your Day!",
      message:
        'Your account is all set up and ready to go. Dive into Taskify’s powerful features and start turning your goals into achievements!',
      modalTitle: 'Account Setup Successful',
      isRead: false
    },

    {
      userId,
      listTitle:
        'Insightful Tip: Master the Art of Prioritization to Achieve Remarkable Daily Results',
      message:
        'Prioritizing your tasks effectively is the key to unlocking a day of unmatched productivity. Check out our expert tips to transform your daily routine.',
      modalTitle: 'Tip of the Day: Embrace Effective Prioritization',
      isRead: false
    }
  ]
  for (const item of newUserNotifications) {
    await notificationModel.createNewNotification(item)
  }
}

const createGuestSampleTasks = async (userId) => {
  const sampleTasks = [
    {
      userId,
      title: 'Welcome to Taskify!',
      description: 'This is a sample task to help you get started',
      priority: 'Priority 1',
      dueDate: Date.now()
    },
    {
      userId,
      title: 'Try creating a new task',
      description: 'Click the + button in the sidebar to create your own task',
      priority: 'Priority 2',
      dueDate: Date.now()
    },
    {
      userId,
      title: 'Mark tasks as complete',
      description: 'Click the circle checkbox to mark tasks as done',
      priority: 'Priority 3',
      dueDate: Date.now()
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
    guestExpiryDate: new Date(Date.now() + 60 * 60 * 1000)
  }

  const result = await userModel.register(guestUser)
  const userId = result.insertedId.toString()
  await createGuestSampleTasks(userId)
  await createNewUserNotifications(userId)
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
