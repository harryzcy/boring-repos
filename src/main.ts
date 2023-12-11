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
const repo = await getRepository(octokit, repos[0].owner.login, repos[0].name)

await fastForwardRepository(octokit, repo, token, appUserID)
