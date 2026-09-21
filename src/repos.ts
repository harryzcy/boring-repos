import type { Octokit } from 'octokit'

import {
  fastForwardRepository,
  getRepositories,
  getRepository
} from './github.js'

export const syncGitHubRepos = async (
  octokit: Octokit,
  appUserID: number | bigint,
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
