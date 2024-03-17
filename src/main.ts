import {
  getAccessToken,
  getAuthenticatedApp,
  getInstallationOctokit,
} from './auth/install.js'
import {
  fastForwardRepository,
  getAppUserID,
  getForkedRepos,
  getRepository,
} from './github.js'

const run = async () => {
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

await run()
