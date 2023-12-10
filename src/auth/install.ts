import { App } from 'octokit'
import { getUsername } from './info.js'

export async function getInstallationOctokit(app: App) {
  const username = getUsername()
  const { data } = await app.octokit.request(
    'GET /users/{username}/installation',
    {
      username: username,
    },
  )
  return app.getInstallationOctokit(data.id)
}
