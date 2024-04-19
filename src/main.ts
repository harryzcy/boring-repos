import { Octokit } from 'octokit'
import {
  getAccessToken,
  getAuthenticatedApp,
  getInstallationOctokit,
} from './auth/install.js'
import {
  deployServerlessRegistry,
  getCloudflareAccountID,
} from './cloudflare.js'
import {
  fastForwardRepository,
  getAppUserID,
  getForkedRepos,
  getRepository,
} from './github.js'

const runGitHub = async (octokit: Octokit, installationId: number) => {
  const appUserID = await getAppUserID(octokit)
  const token = await getAccessToken(octokit, installationId)

  const repos = await getForkedRepos(octokit)

  for (const repo of repos) {
    const repoDetail = await getRepository(octokit, repo.owner.login, repo.name)
    await fastForwardRepository(repoDetail, token, appUserID)
  }
}

const runCloudflare = async (octokit: Octokit) => {
  const accountID = await getCloudflareAccountID()
  // await updateNodeVersion(accountID)

  await deployServerlessRegistry(
    octokit,
    accountID,
    process.env.CLOUDFLARE_API_TOKEN!,
  )
  process.exit(0)
}

const run = async () => {
  const app = await getAuthenticatedApp()
  const { octokit, installationId } = await getInstallationOctokit(app)

  await runCloudflare(octokit)
  await runGitHub(octokit, installationId)
}

await run()
