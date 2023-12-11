import { App } from 'octokit'
import {
  getAppID,
  getClientID,
  getClientSecret,
  getPrivateKey,
} from './auth/info.js'
import { getAccessToken, getInstallationOctokit } from './auth/install.js'
import {
  fastForwardRepository,
  getAppUserID,
  getForkedRepos,
  getRepository,
} from './github.js'

const run = async () => {
  const appId = getAppID()
  const privateKey = await getPrivateKey()
  const clientId = getClientID()
  const clientSecret = getClientSecret()

  const app = new App({
    appId,
    privateKey,
    oauth: { clientId, clientSecret },
  })

  const resp = await app.octokit.rest.apps.getAuthenticated()
  if (resp.status !== 200) throw new Error('Failed to authenticate app')
  const { octokit, installationId } = await getInstallationOctokit(app)

  const appUserID = await getAppUserID(octokit)
  const token = await getAccessToken(octokit, installationId)

  const repos = await getForkedRepos(octokit)

  for (const repo of repos) {
    try {
      const repoDetail = await getRepository(
        octokit,
        repo.owner.login,
        repo.name,
      )
      await fastForwardRepository(octokit, repoDetail, token, appUserID)
    } catch (e) {
      console.error(`Failed to fast-forward ${repo.full_name}`)
    }
  }
}

await run()
