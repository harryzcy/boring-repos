import {
  getAccessToken,
  getAuthenticatedApp,
  getInstallationOctokit,
} from './auth/install.js'
import { getCloudflareAccountID, updateNodeVersion } from './cloudflare.js'
import {
  fastForwardRepository,
  getAppUserID,
  getForkedRepos,
  getRepository,
} from './github.js'

const runGitHub = async () => {
  const app = await getAuthenticatedApp()
  const { octokit, installationId } = await getInstallationOctokit(app)

  const appUserID = await getAppUserID(octokit)
  const token = await getAccessToken(octokit, installationId)

  const repos = await getForkedRepos(octokit)

  for (const repo of repos) {
    const repoDetail = await getRepository(octokit, repo.owner.login, repo.name)
    await fastForwardRepository(repoDetail, token, appUserID)
  }
}

const runCloudflare = async () => {
  const accountID = await getCloudflareAccountID()
  await updateNodeVersion(accountID)
}

const run = async () => {
  await runCloudflare()
  await runGitHub()
}

await run()
