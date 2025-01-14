import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.js'

let taskifyDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  taskifyDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!taskifyDatabaseInstance) {
    throw new Error('Must connect to Database first!')
  }

  return taskifyDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
