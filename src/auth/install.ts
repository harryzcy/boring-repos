import { App, Octokit } from 'octokit'
import { getUsername } from './info.js'

export const getInstallationOctokit = async (app: App) => {
  const username = getUsername()
  const { data } = await app.octokit.request(
    'GET /users/{username}/installation',
    {
      username: username,
    },
  )
  return {
    octokit: await app.getInstallationOctokit(data.id),
    installationId: data.id,
  }
}

export const getAccessToken = async (
  octokit: Octokit,
  installationId: number,
) => {
  const { data } = await octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    {
      installation_id: installationId,
    },
  )
  return data.token
}
