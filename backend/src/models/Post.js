import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 500 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0, min: 0 },
}, { timestamps: true, versionKey: false })

// Supports the required $lookup by author and that user's newest-first post list.
postSchema.index({ author: 1, _id: -1 }, { name: 'post_author_newest' })
postSchema.set('toJSON', { transform: (_document, value) => { value.id = value._id.toString(); delete value._id; return value } })

export const Post = mongoose.model('Post', postSchema)
