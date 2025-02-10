import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'

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
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({ message: 'Logout successful' })
  } catch (error) {
    next(error)
  }
}

const loginAsGuest = async (req, res, next) => {
  try {
    const result = await authService.loginAsGuest()
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const authController = {
  register,
  login,
  logout,
  loginAsGuest
}
