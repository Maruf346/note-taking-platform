import 'dotenv/config'
import { connectDatabase } from '../src/config/database.js'
import { User } from '../src/models/User.js'

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding')
if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters')

await connectDatabase()
const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
if (existing) {
  existing.name = ADMIN_NAME
  existing.password = ADMIN_PASSWORD
  existing.role = 'admin'
  await existing.save()
  console.log(`Updated admin: ${existing.email}`)
} else {
  const user = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin', interests: [] })
  console.log(`Created admin: ${user.email}`)
}
process.exit(0)
