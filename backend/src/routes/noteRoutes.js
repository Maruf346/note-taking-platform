import { Router } from 'express'
import { createNote, deleteNote, getNote, listNotes, updateNote } from '../controllers/noteController.js'
import { authenticate } from '../middleware/auth.js'

export const noteRouter = Router()
noteRouter.use(authenticate)
noteRouter.route('/').get(listNotes).post(createNote)
noteRouter.route('/:id').get(getNote).patch(updateNote).delete(deleteNote)
