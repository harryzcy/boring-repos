import { Octokit } from 'octokit'
import {
  fastForwardRepository,
  getRepositories,
  getRepository,
  updateRepositoryLabels
} from './github.js'

export const syncGitHubRepos = async (
  octokit: Octokit,
  appUserID: number,
  token: string
) => {
  const forkedRepos = await getRepositories(octokit, { isFork: true })
  for (const repo of forkedRepos) {
    const result = await getRepository(octokit, repo.owner.login, repo.name)
    if (!result.success) {
      console.error(
        `Skipping fast-forward for ${repo.full_name} due to error fetching repository details.`
      )
      continue
    }
    await fastForwardRepository(result.data, token, appUserID)
  }
}

export const updateGitHubLabels = async (octokit: Octokit) => {
  const originalRepos = await getRepositories(octokit, { isFork: false })
  for (const repo of originalRepos) {
    await updateRepositoryLabels(octokit, repo.owner.login, repo.name)
  }
}
