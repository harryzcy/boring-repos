import { assert } from 'console'
import fs from 'fs'
import { test } from 'vitest'
import { checkIfBranchExists, cloneRepository } from './git.js'

test('Clone repository', async () => {
  const dir = await cloneRepository(
    'https://github.com/harryzcy/boring-repos',
    'boring-repos',
  )
  assert(dir.startsWith('boring-repos'))
  assert(fs.existsSync(dir))

  fs.rmSync(dir, { recursive: true, force: true })
})

test('Check branch exists', async () => {
  const dir = await cloneRepository(
    'https://github.com/harryzcy/boring-repos',
    'boring-repos',
  )
  const exists = await checkIfBranchExists(dir, 'main')
  assert(exists)

  const notExists = await checkIfBranchExists(dir, 'not-exists')
  assert(!notExists)

  fs.rmSync(dir, { recursive: true, force: true })
})
