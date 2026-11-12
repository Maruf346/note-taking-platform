import { Router } from 'express'
import { createPost, deletePost, listPosts, postsByUser, updatePost } from '../controllers/postController.js'
import { authenticate } from '../middleware/auth.js'

export const postRouter = Router()
postRouter.get('/', listPosts)
postRouter.post('/', authenticate, createPost)
postRouter.patch('/:id', authenticate, updatePost)
postRouter.delete('/:id', authenticate, deletePost)

export const userPostRouter = Router()
userPostRouter.get('/:id/posts', postsByUser)
