import { describe, expect, it } from 'vitest'

import fs from 'node:fs/promises'

import { checkIfBranchExists, cloneRepository } from './git.js'

describe('Git', () => {
  it('clone repository', async () => {
    const dir = await cloneRepository(
      'https://github.com/harryzcy/boring-repos',
      'boring-repos'
    )
    expect(dir).toContain('boring-repos')
    const exists = await fs
      .access(dir)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    await fs.rm(dir, { force: true, recursive: true })
  })

  it('check branch exists', async () => {
    const dir = await cloneRepository(
      'https://github.com/harryzcy/boring-repos',
      'boring-repos'
    )
    const exists = await checkIfBranchExists(dir, 'main')
    expect(exists).toBe(true)

    const notExists = await checkIfBranchExists(dir, 'not-exists')
    expect(notExists).toBe(false)

    await fs.rm(dir, { force: true, recursive: true })
  })
})
