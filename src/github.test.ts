import { assert, expect, test } from 'vitest'
import { getAuthenticatedApp, getInstallationOctokit } from './auth/install.js'
import {
  createRepositoryLabel,
  getAppUserID,
  getRepositories,
  getRepositoryLabels
} from './github.js'

test('Get app user ID', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const id = await getAppUserID(octokit)
  assert(id > 0)
})

test('Get forked repos', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const repos = await getRepositories(octokit, { isFork: true })
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
    repo: 'boring-repos'
  })
  expect(repo.status).toBe(200)
  assert(repo.data.full_name === 'harryzcy/boring-repos')
  assert(!repo.data.fork)
})

test('Get repository labels', async () => {
  const app = await getAuthenticatedApp()
  const { octokit } = await getInstallationOctokit(app)
  const labels = await getRepositoryLabels(octokit, 'harryzcy', 'boring-repos')
  assert(labels.length > 0)
  assert(labels.some((label) => label.name === 'dependencies'))
})

test.skip('Manage repository labels', async () => {
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
      name: newLabel,
      color: 'f29513',
      description: 'This is a test label'
    })
  }

  // Update the new label
  await octokit.request('PATCH /repos/{owner}/{repo}/labels/{name}', {
    owner,
    repo,
    name: newLabel,
    description: 'This is an updated test label'
  })

  // Get the updated label
  const resp = await octokit.request(
    'GET /repos/{owner}/{repo}/labels/{name}',
    {
      owner,
      repo,
      name: newLabel
    }
  )
  expect(resp.data.description).toBe('This is an updated test label')

  // Delete the new label
  await octokit.request('DELETE /repos/{owner}/{repo}/labels/{name}', {
    owner,
    repo,
    name: newLabel
  })
})
