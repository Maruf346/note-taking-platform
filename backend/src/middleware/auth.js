import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verifyToken } from '../utils/jwt.js'

export const authenticate = asyncHandler(async (request, _response, next) => {
  const [scheme, token] = (request.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) throw new AppError('Authentication required', 401)
  let payload
  try { payload = verifyToken(token) } catch { throw new AppError('Invalid or expired token', 401) }
  const user = await User.findById(payload.sub)
  if (!user) throw new AppError('The account for this token no longer exists', 401)
  request.user = user
  next()
})

export const authorize = (...roles) => (request, _response, next) => {
  if (!roles.includes(request.user.role)) return next(new AppError('You do not have permission for this action', 403))
  next()
}
