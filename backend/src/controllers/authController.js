import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/jwt.js'
import { cleanInterests, requireFields } from '../utils/validation.js'

export const register = asyncHandler(async (request, response) => {
  requireFields(request.body, ['name', 'email', 'password'])
  const user = await User.create({ name: request.body.name, email: request.body.email, password: request.body.password, interests: cleanInterests(request.body.interests) })
  response.status(201).json({ token: signToken(user.id), user })
})

export const login = asyncHandler(async (request, response) => {
  requireFields(request.body, ['email', 'password'])
  const user = await User.findOne({ email: request.body.email.toLowerCase().trim() }).select('+password')
  if (!user || !(await user.comparePassword(request.body.password))) throw new AppError('Incorrect email or password', 401)
  response.json({ token: signToken(user.id), user })
})

export const me = asyncHandler(async (request, response) => response.json({ user: request.user }))
