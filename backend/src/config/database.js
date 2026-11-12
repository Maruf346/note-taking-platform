import mongoose from 'mongoose'

const cache = globalThis.__mongooseCache || { connection: null, promise: null }
globalThis.__mongooseCache = cache

export async function connectDatabase() {
  if (cache.connection) return cache.connection
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured')
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    })
  }
  try {
    cache.connection = await cache.promise
    return cache.connection
  } catch (error) {
    cache.promise = null
    throw error
  }
}

export async function databaseMiddleware(_request, _response, next) {
  try { await connectDatabase(); next() } catch (error) { next(error) }
}
