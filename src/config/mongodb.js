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
  try {
    // Connect to MongoDB server
    await mongoClientInstance.connect()

    // Get database reference
    taskifyDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

    // Actually verify we can interact with the database
    await taskifyDatabaseInstance.command({ ping: 1 })

    // Optional: Check if any collections exist
    // const collections = await taskifyDatabaseInstance
    //   .listCollections()
    //   .toArray()
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`)
    // Clean up on error
    taskifyDatabaseInstance = null
    await mongoClientInstance.close()
    throw error
  }
}

export const GET_DB = () => {
  if (!taskifyDatabaseInstance) {
    throw new Error('Must connect to Database first!')
  }
  return taskifyDatabaseInstance
}

export const CLOSE_DB = async () => {
  try {
    await mongoClientInstance.close()
    taskifyDatabaseInstance = null
    console.log('Database connection closed')
  } catch (error) {
    console.error('Error closing database connection:', error)
    throw error
  }
}
