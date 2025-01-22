import { userModel } from '~/models/userModel'
import bcrypt from 'bcrypt'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
const register = async (reqBody) => {
  try {
    const existingUser = await userModel.findByEmail(reqBody.email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    const hashedPassword = await bcrypt.hash(reqBody.password, 10)
    const userToCreate = { ...reqBody, password: hashedPassword }
    const result = await userModel.register(userToCreate)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const authService = {
  register
}
