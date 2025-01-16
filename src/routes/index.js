import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { taskRoute } from './taskRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

Router.use('/tasks', taskRoute)

export const APIs_V1 = Router
