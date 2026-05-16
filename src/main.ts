import { Octokit } from 'octokit'
import {
  getAccessToken,
  getAuthenticatedApp,
  getInstallationOctokit
} from './auth/install.js'
import {
  deployServerlessRegistry,
  getCloudflareAccountID,
  updateNodeVersion
} from './cloudflare.js'
import { getAppUserID, getRepositories } from './github.js'
import { checkNpmrcFile, syncGitHubRepos, updateGitHubLabels } from './repos.js'

const runGitHub = async (octokit: Octokit, installationId: number) => {
  const appUserID = await getAppUserID(octokit)
  const token = await getAccessToken(octokit, installationId)

  const forkedRepos = await getRepositories(octokit, { isFork: true })
  const originalRepos = await getRepositories(octokit, { isFork: false })

  await syncGitHubRepos(octokit, appUserID, token, forkedRepos)
  await updateGitHubLabels(octokit, originalRepos)
  await checkNpmrcFile(octokit, originalRepos)
}

const runCloudflare = async (octokit: Octokit) => {
  const accountID = getCloudflareAccountID()
  await updateNodeVersion(accountID)

  await deployServerlessRegistry(
    octokit,
    accountID,
    process.env.CLOUDFLARE_API_TOKEN ?? ''
  )
}

const run = async () => {
  const app = await getAuthenticatedApp()
  const { octokit, installationId } = await getInstallationOctokit(app)

  await runCloudflare(octokit)
  await runGitHub(octokit, installationId)
}

await run()
