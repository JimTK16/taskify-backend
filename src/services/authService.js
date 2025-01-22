import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { generateToken } from '~/utils/jwtHelper'

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
export const authService = {
  register,
  login
}
