import { Post } from '../models/Post.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginated, pagination } from '../utils/pagination.js'
import { objectId, requireFields } from '../utils/validation.js'

export const listPosts = asyncHandler(async (request, response) => {
  const { page, limit, skip } = pagination(request.query)
  const [results, total] = await Promise.all([Post.find().sort({ _id: -1 }).skip(skip).limit(limit).populate('author', 'name email'), Post.countDocuments()])
  response.json(paginated(results, total, page, limit))
})

export const createPost = asyncHandler(async (request, response) => {
  requireFields(request.body, ['content'])
  const post = await Post.create({ content: request.body.content, author: request.user._id })
  await post.populate('author', 'name email')
  response.status(201).json(post)
})

export const updatePost = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'post'); requireFields(request.body, ['content'])
  const post = await Post.findOneAndUpdate({ _id: request.params.id, author: request.user._id }, { content: request.body.content }, { new: true, runValidators: true }).populate('author', 'name email')
  if (!post) throw new AppError('Post not found', 404)
  response.json(post)
})

export const deletePost = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'post')
  const post = await Post.findOneAndDelete({ _id: request.params.id, author: request.user._id })
  if (!post) throw new AppError('Post not found', 404)
  response.status(204).end()
})

export const postsByUser = asyncHandler(async (request, response) => {
  const userId = objectId(request.params.id, 'user'); const { page, limit, skip } = pagination(request.query)
  // Required scenario: one aggregate() call, with $lookup. The foreign author index supports its first stage.
  const [result] = await User.aggregate([
    { $match: { _id: userId } },
    { $lookup: { from: 'posts', let: { userId: '$_id' }, pipeline: [
      { $match: { $expr: { $eq: ['$author', '$$userId'] } } },
      { $sort: { _id: -1 } },
      { $facet: { results: [{ $skip: skip }, { $limit: limit }, { $project: { id: { $toString: '$_id' }, _id: 0, content: 1, likes: 1, createdAt: 1, updatedAt: 1 } }], metadata: [{ $count: 'total' }] } },
      { $project: { results: 1, total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] } } },
    ], as: 'postPage' } },
    { $project: { _id: 0, user: { id: { $toString: '$_id' }, name: '$name', email: '$email' }, results: { $ifNull: [{ $arrayElemAt: ['$postPage.results', 0] }, []] }, total: { $ifNull: [{ $arrayElemAt: ['$postPage.total', 0] }, 0] } } },
  ])
  if (!result) throw new AppError('User not found', 404)
  response.json({ ...result, page, limit, totalPages: Math.max(1, Math.ceil(result.total / limit)) })
})
