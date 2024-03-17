import { assert } from 'console'
import fs from 'fs'
import { test } from 'vitest'
import { cloneRepository } from './git.js'

test('Clone repository', async () => {
  const dir = await cloneRepository(
    'https://github.com/harryzcy/boring-repos',
    'boring-repos',
  )
  assert(dir.startsWith('boring-repos'))
  assert(fs.existsSync(dir))

  fs.rmSync(dir, { recursive: true, force: true })
})
