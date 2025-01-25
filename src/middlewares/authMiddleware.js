import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { verifyToken } from '~/utils/jwtHelper'

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required')
    }

    const decoded = verifyToken(token)
    const user = await userModel.findById(decoded.userId)

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found')
    }

    // Add the user to the request object
    req.user = decoded
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'))
  }
}
