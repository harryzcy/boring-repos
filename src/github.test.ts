import { assert } from 'console'
import { test } from 'vitest'
import { getAuthenticatedApp, getInstallationOctokit } from './auth/install.js'
import { getForkedRepos } from './github.js'

test('Get forked repos', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const repos = await getForkedRepos(octokit)
  assert(repos.length > 0)

  const expected = ['gitea', 'serverless-registry', 'homepage']
  const actual = repos.map((repo) => repo.name)
  for (const name of expected) {
    assert(actual.includes(name))
  }
})
