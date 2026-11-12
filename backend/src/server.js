import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'

const port = Number(process.env.PORT) || 8000

await connectDatabase()
app.listen(port, () => console.log(`Noted API listening on http://localhost:${port}`))
