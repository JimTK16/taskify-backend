import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { authService } from '~/services/authService'
import ApiError from '~/utils/ApiError'
import {
  generateRefreshToken,
  generateToken,
  verifyToken
} from '~/utils/jwtHelper'

const register = async (req, res, next) => {
  try {
    const createdUser = await authService.register(req.body)

    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: req.secure || env.BUILD_MODE === 'production',
      // sameSite: 'strict',
      sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(StatusCodes.OK).json({
      user: result.user,
      accessToken: result.accessToken
    })
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: req.secure || env.BUILD_MODE === 'production',
      // sameSite: 'strict',
      sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax'
    })
    res.status(StatusCodes.OK).json({ message: 'Logout successful' })
  } catch (error) {
    next(error)
  }
}

const loginAsGuest = async (req, res, next) => {
  try {
    const result = await authService.loginAsGuest()

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: req.secure || env.BUILD_MODE === 'production',
      // sameSite: 'strict',
      sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(StatusCodes.OK).json({
      user: result.user,
      accessToken: result.accessToken
    })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Refresh token not found', code: 'NO_REFRESH_TOKEN' })
    }
    const decoded = verifyToken(refreshToken, true)
    const user = await userModel.findById(decoded.userId)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found')
    }

    const newAccessToken = generateToken(user._id.toString())
    const newRefreshToken = generateRefreshToken(user._id.toString())
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: req.secure || env.BUILD_MODE === 'production',
      // sameSite: 'strict',
      sameSite: env.BUILD_MODE === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    res.status(StatusCodes.OK).json({
      accessToken: newAccessToken,
      user: { email: user.email, userId: user._id.toString() }
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token'))
  }
}
export const authController = {
  register,
  login,
  logout,
  loginAsGuest,
  refreshToken
}
