import { Octokit } from 'octokit'
import {
  fastForwardRepository,
  GetRepositoriesResponse,
  getRepository,
  updateRepositoryLabels
} from './github.js'

export const syncGitHubRepos = async (
  octokit: Octokit,
  appUserID: number,
  token: string,
  forkedRepos: GetRepositoriesResponse
) => {
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

export const updateGitHubLabels = async (
  octokit: Octokit,
  originalRepos: GetRepositoriesResponse
) => {
  for (const repo of originalRepos) {
    await updateRepositoryLabels(octokit, repo.owner.login, repo.name)
  }
}

export const checkNpmrcFile = async (
  octokit: Octokit,
  originalRepos: GetRepositoriesResponse
) => {
  for (const repo of originalRepos) {
    console.log(`Checking .npmrc file for ${repo.full_name}`)

    // Check if package.json exists in the repository before checking for .npmrc
    try {
      await octokit.rest.repos.getContent({
        owner: repo.owner.login,
        repo: repo.name,
        path: 'package.json'
      })
    } catch (error) {
      console.warn(
        `No package.json file found for ${repo.full_name}. Skipping .npmrc check.`,
        error
      )
      continue
    }

    // Check for .npmrc file in the repository
    try {
      await octokit.rest.repos.getContent({
        owner: repo.owner.login,
        repo: repo.name,
        path: '.npmrc'
      })
      console.log(`Found .npmrc file for ${repo.full_name}`)
    } catch (error) {
      // check if error is a 404, if not log the error
      console.error(`Error checking .npmrc file for ${repo.full_name}:`, error)
    }
  }
}
