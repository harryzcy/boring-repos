import { assert } from 'console'
import fs from 'fs/promises'
import { test } from 'vitest'

import { checkIfBranchExists, cloneRepository } from './git.js'

test('Clone repository', async () => {
  const dir = await cloneRepository(
    'https://github.com/harryzcy/boring-repos',
    'boring-repos'
  )
  assert(dir.startsWith('boring-repos'))
  const exists = await fs
    .access(dir)
    .then(() => true)
    .catch(() => false)
  assert(exists)

  await fs.rm(dir, { force: true, recursive: true })
})

test('Check branch exists', async () => {
  const dir = await cloneRepository(
    'https://github.com/harryzcy/boring-repos',
    'boring-repos'
  )
  const exists = await checkIfBranchExists(dir, 'main')
  assert(exists)

  const notExists = await checkIfBranchExists(dir, 'not-exists')
  assert(!notExists)

  await fs.rm(dir, { force: true, recursive: true })
})
