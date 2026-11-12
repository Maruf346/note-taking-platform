import { Router } from 'express'
import { createUser, deleteUser, getUser, groupUsersByInterest, listAllNotes, listUsers, updateUser } from '../controllers/adminController.js'
import { authenticate, authorize } from '../middleware/auth.js'

export const adminRouter = Router()
adminRouter.use(authenticate, authorize('admin'))
adminRouter.get('/notes', listAllNotes)
adminRouter.get('/interests/groups', groupUsersByInterest)
adminRouter.route('/users').get(listUsers).post(createUser)
adminRouter.route('/users/:id').get(getUser).patch(updateUser).delete(deleteUser)
