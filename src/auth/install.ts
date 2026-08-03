import { App } from 'octokit'
import type { Octokit } from 'octokit'

import {
  getAppID,
  getClientID,
  getClientSecret,
  getPrivateKey,
  getUsername
} from './info.js'

export const getAuthenticatedApp = async () => {
  const appId = getAppID()
  const privateKey = await getPrivateKey()
  const clientId = getClientID()
  const clientSecret = getClientSecret()

  const app = new App({
    appId,
    oauth: { clientId, clientSecret },
    privateKey
  })

  // Throws a RequestError if the app credentials are not valid
  await app.octokit.rest.apps.getAuthenticated()

  return app
}

export const getInstallationOctokit = async (app: App) => {
  const username = getUsername()
  const { data } = await app.octokit.request(
    'GET /users/{username}/installation',
    {
      username
    }
  )
  return {
    installationId: data.id,
    octokit: await app.getInstallationOctokit(data.id)
  }
}

export const getAccessToken = async (
  octokit: Octokit,
  installationId: number
) => {
  const { data } = await octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    {
      installation_id: installationId
    }
  )
  return data.token
}
