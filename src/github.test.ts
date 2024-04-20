import { assert, test } from 'vitest'
import { getAuthenticatedApp, getInstallationOctokit } from './auth/install.js'
import { getAppUserID, getForkedRepos } from './github.js'

test('Get app user ID', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const id = await getAppUserID(octokit)
  assert(id > 0)
})

test('Get forked repos', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const repos = await getForkedRepos(octokit)
  assert(repos.length > 0)

  const expected = ['gitea', 'serverless-registry', 'homepage', 'MediaCrawler']
  const actual = repos.map((repo) => repo.name)
  console.log(actual)
  for (const name of expected) {
    assert(actual.includes(name))
  }
  assert(!actual.includes('not exist'))
})

test('Get a repository', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const repo = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: 'harryzcy',
    repo: 'boring-repos',
  })
  assert(repo.status === 200)
  assert(repo.data.full_name === 'harryzcy/boring-repos')
  assert(repo.data.fork === false)
})
