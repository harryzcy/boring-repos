import { assert, describe, expect, it } from 'vitest'

import { getAppUserID, getRepositories } from './github.js'
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
})
