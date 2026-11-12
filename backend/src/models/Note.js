import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true, trim: true, maxlength: 20000 },
  color: { type: String, enum: ['violet', 'amber', 'sky', 'emerald'], default: 'violet' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, versionKey: false })

// Equality on owner followed by newest-first cursor/order. Global admin reads use _id.
noteSchema.index({ owner: 1, _id: -1 }, { name: 'note_owner_newest' })
noteSchema.set('toJSON', { transform: (_document, value) => { value.id = value._id.toString(); delete value._id; return value } })

export const Note = mongoose.model('Note', noteSchema)
