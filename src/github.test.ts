import { assert, describe, expect, it } from 'vitest'

import {
  createRepositoryLabel,
  getAppUserID,
  getRepositories,
  getRepositoryLabels
} from './github.js'
import { getAuthenticatedApp, getInstallationOctokit } from './auth/install.js'

const isIntegration = process.env.INTEGRATION === 'true'

describe.runIf(!isIntegration)('GitHub API', () => {
  it('get app user ID', async () => {
    const app = await getAuthenticatedApp()
    const { octokit } = await getInstallationOctokit(app)
    const id = await getAppUserID(octokit)
    assert(id > 0)
  })

  it('get forked repos', async () => {
    const app = await getAuthenticatedApp()
    const { octokit } = await getInstallationOctokit(app)
    const repos = await getRepositories(octokit, { isFork: true })
    assert(repos.length > 0)

    const expected = [
      'gitea',
      'serverless-registry',
      'homepage',
      'MediaCrawler'
    ]
    const actual = repos.map((repo) => repo.name)
    console.log(actual)
    for (const name of expected) {
      assert(actual.includes(name))
    }
    assert(!actual.includes('not exist'))
  })
})

describe.runIf(!isIntegration)('GitHub API - Repository', () => {
  it('get a repository', async () => {
    const app = await getAuthenticatedApp()
    const { octokit } = await getInstallationOctokit(app)
    const repo = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: 'harryzcy',
      repo: 'boring-repos'
    })
    const HTTP_OK = 200
    expect(repo.status).toBe(HTTP_OK)
    assert(repo.data.full_name === 'harryzcy/boring-repos')
    assert(!repo.data.fork)
  })

  it('get repository labels', async () => {
    const app = await getAuthenticatedApp()
    const { octokit } = await getInstallationOctokit(app)
    const labels = await getRepositoryLabels(
      octokit,
      'harryzcy',
      'boring-repos'
    )
    assert(labels.length > 0)
    assert(labels.some((label) => label.name === 'dependencies'))
  })
})

describe.runIf(isIntegration)('GitHub API - Integration', () => {
  // oxlint-disable-next-line max-statements
  it('manage repository labels', async () => {
    const app = await getAuthenticatedApp()
    const { octokit } = await getInstallationOctokit(app)
    const repo = 'boring-repos'
    const owner = 'harryzcy'
    const labels = await getRepositoryLabels(octokit, owner, repo)
    const labelNames = labels.map((label) => label.name)

    // Create a new label
    const newLabel = 'test-label'
    if (!labelNames.includes(newLabel)) {
      await createRepositoryLabel(octokit, owner, repo, {
        color: 'f29513',
        description: 'This is a test label',
        name: newLabel
      })
    }

    // Update the new label
    await octokit.request('PATCH /repos/{owner}/{repo}/labels/{name}', {
      description: 'This is an updated test label',
      name: newLabel,
      owner,
      repo
    })

    // Get the updated label
    const resp = await octokit.request(
      'GET /repos/{owner}/{repo}/labels/{name}',
      {
        name: newLabel,
        owner,
        repo
      }
    )
    expect(resp.data.description).toBe('This is an updated test label')

    // Delete the new label
    await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {
      name: newLabel,
      owner,
      repo
    })
  })
})
