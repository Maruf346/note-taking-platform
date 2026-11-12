import assert from 'node:assert/strict'
import test from 'node:test'
import { paginated, pagination } from '../src/utils/pagination.js'

test('pagination applies safe defaults and limits', () => {
  assert.deepEqual(pagination({}), { page: 1, limit: 10, skip: 0 })
  assert.deepEqual(pagination({ page: '3', limit: '25' }), { page: 3, limit: 25, skip: 50 })
  assert.equal(pagination({ limit: '999' }).limit, 100)
})

test('paginated returns stable metadata', () => {
  assert.deepEqual(paginated(['a'], 21, 2, 10), { results: ['a'], page: 2, limit: 10, total: 21, totalPages: 3 })
})
