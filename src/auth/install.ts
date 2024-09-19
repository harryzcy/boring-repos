import { App, Octokit } from 'octokit'
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
    privateKey,
    oauth: { clientId, clientSecret }
  })

  const resp = await app.octokit.rest.apps.getAuthenticated()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (resp.status !== 200) throw new Error('Failed to authenticate app')

  return app
}

export const getInstallationOctokit = async (app: App) => {
  const username = getUsername()
  const { data } = await app.octokit.request(
    'GET /users/{username}/installation',
    {
      username: username
    }
  )
  return {
    octokit: await app.getInstallationOctokit(data.id),
    installationId: data.id
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
