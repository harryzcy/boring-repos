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
import { getAppUserID } from './github.js'
import { syncGitHubRepos, updateGitHubLabels } from './repos.js'

const runGitHub = async (octokit: Octokit, installationId: number) => {
  const appUserID = await getAppUserID(octokit)
  const token = await getAccessToken(octokit, installationId)

  await syncGitHubRepos(octokit, appUserID, token)
  await updateGitHubLabels(octokit)
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

  let hasError = false
  try {
    await runCloudflare(octokit)
  } catch (error) {
    console.error('Error running Cloudflare tasks:', error)
    hasError = true
  }
  try {
    await runGitHub(octokit, installationId)
  } catch (error) {
    console.error('Error running GitHub tasks:', error)
    hasError = true
  }
  if (hasError) {
    process.exit(1)
  }
}

await run()
