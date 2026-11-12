import assert from 'node:assert/strict'
import test from 'node:test'
import app from '../src/app.js'

test('health endpoint responds without a database round trip', async () => {
  const server = app.listen(0)
  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
