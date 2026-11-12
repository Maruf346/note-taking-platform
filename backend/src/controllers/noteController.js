import { Note } from '../models/Note.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginated, pagination } from '../utils/pagination.js'
import { objectId, requireFields } from '../utils/validation.js'

const notePayload = (body) => Object.fromEntries(['title', 'content', 'color'].filter((key) => body[key] !== undefined).map((key) => [key, body[key]]))

export const listNotes = asyncHandler(async (request, response) => {
  const { page, limit, skip } = pagination(request.query)
  const filter = { owner: request.user._id }
  const [results, total] = await Promise.all([Note.find(filter).sort({ _id: -1 }).skip(skip).limit(limit), Note.countDocuments(filter)])
  response.json(paginated(results, total, page, limit))
})

export const createNote = asyncHandler(async (request, response) => {
  requireFields(request.body, ['title', 'content'])
  const note = await Note.create({ ...notePayload(request.body), owner: request.user._id })
  response.status(201).json(note)
})

export const getNote = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'note')
  const note = await Note.findById(request.params.id).populate('owner', 'name email')
  if (!note) throw new AppError('Note not found', 404)
  if (request.user.role !== 'admin' && !note.owner._id.equals(request.user._id)) throw new AppError('Note not found', 404)
  response.json(note)
})

export const updateNote = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'note')
  const note = await Note.findOneAndUpdate({ _id: request.params.id, owner: request.user._id }, notePayload(request.body), { new: true, runValidators: true })
  if (!note) throw new AppError('Note not found', 404)
  response.json(note)
})

export const deleteNote = asyncHandler(async (request, response) => {
  objectId(request.params.id, 'note')
  const note = await Note.findOneAndDelete({ _id: request.params.id, owner: request.user._id })
  if (!note) throw new AppError('Note not found', 404)
  response.status(204).end()
})
