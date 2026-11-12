import { Note } from '../models/Note.js'
import { Post } from '../models/Post.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginated, pagination } from '../utils/pagination.js'
import { cleanInterests, objectId, requireFields } from '../utils/validation.js'

export const listUsers = asyncHandler(async (request, response) => {
  const { page, limit, skip } = pagination(request.query)
  const [results, total] = await Promise.all([User.find().sort({ _id: -1 }).skip(skip).limit(limit), User.countDocuments()])
  response.json(paginated(results, total, page, limit))
})

export const createUser = asyncHandler(async (request, response) => {
  requireFields(request.body, ['name', 'email', 'password'])
  const user = await User.create({ name: request.body.name, email: request.body.email, password: request.body.password, role: request.body.role || 'user', interests: cleanInterests(request.body.interests) })
  response.status(201).json(user)
})

export const getUser = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'user')
  const user = await User.findById(request.params.id)
  if (!user) throw new AppError('User not found', 404)
  response.json(user)
})

export const updateUser = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'user')
  const user = await User.findById(request.params.id).select('+password')
  if (!user) throw new AppError('User not found', 404)
  for (const key of ['name', 'email', 'role', 'password']) if (request.body[key] !== undefined) user[key] = request.body[key]
  if (request.body.interests !== undefined) user.interests = cleanInterests(request.body.interests)
  await user.save()
  response.json(user)
})

export const deleteUser = asyncHandler(async (request, response) => {
  const userId = objectId(request.params.id, 'user')
  if (request.user._id.equals(userId)) throw new AppError('You cannot remove your own account', 400)
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404)
  await Promise.all([Note.deleteMany({ owner: userId }), Post.deleteMany({ author: userId }), user.deleteOne()])
  response.status(204).end()
})

export const listAllNotes = asyncHandler(async (request, response) => {
  const { page, limit, skip } = pagination(request.query)
  const [results, total] = await Promise.all([Note.find().sort({ _id: -1 }).skip(skip).limit(limit).populate('owner', 'name email'), Note.countDocuments()])
  response.json(paginated(results, total, page, limit))
})

export const groupUsersByInterest = asyncHandler(async (request, response) => {
  const { page, limit, skip } = pagination(request.query)
  // Required scenario: exactly one aggregate() call and no supporting query.
  // Grouping the entire collection cannot benefit from an interests index, so none is added.
  const [result] = await User.aggregate([
    { $unwind: '$interests' },
    { $group: { _id: { $toLower: '$interests' }, interest: { $first: '$interests' }, count: { $sum: 1 }, users: { $push: { id: { $toString: '$_id' }, name: '$name', email: '$email', role: '$role' } } } },
    { $sort: { count: -1, _id: 1 } },
    { $facet: { results: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 0, interest: 1, count: 1, users: 1 } }], metadata: [{ $count: 'total' }] } },
    { $project: { results: 1, total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] } } },
  ])
  const total = result?.total || 0
  response.json({ results: result?.results || [], page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) })
})
