import mongoose from 'mongoose'
import { AppError } from './AppError.js'

export function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '')
  if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400)
}

export function objectId(value, label = 'resource') {
  if (!mongoose.isObjectIdOrHexString(value)) throw new AppError(`Invalid ${label} id`, 400)
  return new mongoose.Types.ObjectId(value)
}

export function cleanInterests(interests = []) {
  if (!Array.isArray(interests)) throw new AppError('Interests must be an array', 400)
  return [...new Set(interests.map((item) => String(item).trim()).filter(Boolean))].slice(0, 20)
}
