import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { taskRoute } from './taskRoute'
import { authRoute } from './authRoute'
import { notificationRoute } from './notificationRoute'
import { labelRoute } from './labelRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

Router.use('/tasks', taskRoute)
Router.use('/notifications', notificationRoute)
Router.use('/users', authRoute)
Router.use('/labels', labelRoute)

export const APIs_V1 = Router
