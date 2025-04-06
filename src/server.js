import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/index'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { userModel } from './models/userModel'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  app.use(cookieParser())

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  const port = process.env.PORT || 3000

  if (env.BUILD_MODE === 'production') {
    app.listen(port, () => {
      console.log(`Production: Server is running on port ${port}`)
    })
  } else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `Development: Server is running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

  exitHook(() => {
    CLOSE_DB()
  })
}

CONNECT_DB()
  .then(() => {
    console.log('Connected to MongoDB')

    // Cleanup guest accounts every day at midnight
    cron.schedule('0 * * * *', async () => {
      await userModel.cleanupGuestAccounts()
    })
  })
  .then(() => {
    START_SERVER()
  })
  .catch((err) => {
    console.error(err)
    process.exit(0)
  })
