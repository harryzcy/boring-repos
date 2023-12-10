import { App } from 'octokit'
import {
  getAppID,
  getClientID,
  getClientSecret,
  getPrivateKey,
} from './auth/info.js'
import { getInstallationOctokit } from './auth/install.js'

const appId = getAppID()
const privateKey = await getPrivateKey()
const clientId = getClientID()
const clientSecret = getClientSecret()

const app = new App({
  appId,
  privateKey,
  oauth: { clientId, clientSecret },
})

await app.octokit.rest.apps.getAuthenticated()
const octokit = await getInstallationOctokit(app)
console.log(octokit)
