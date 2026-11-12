import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  interests: [{ type: String, trim: true, maxlength: 40 }],
}, { timestamps: true, versionKey: false })

// Login/email lookup. _id already indexes profile reads and the admin user list.
userSchema.index({ email: 1 }, { unique: true, name: 'user_email_unique' })

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidate) { return bcrypt.compare(candidate, this.password) }
userSchema.set('toJSON', { transform: (_document, value) => { value.id = value._id.toString(); delete value._id; delete value.password; return value } })

export const User = mongoose.model('User', userSchema)
