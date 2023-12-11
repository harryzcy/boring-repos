import { Endpoints } from '@octokit/types'
import { Octokit } from 'octokit'
import {
  addUpstream,
  cloneRepository,
  fastForwardMerge,
  fetchUpstream,
  getDefaultBranch,
} from './git.js'

export type GetForkedRepositoriesResponse =
  Endpoints['GET /user/repos']['response']['data']

type GetRepositoryResponse =
  Endpoints['GET /repos/{owner}/{repo}']['response']['data']

const IGNORE_REPOS = process.env.IGNORE_REPOS?.split(',') ?? []

export const getForkedRepos = async (
  octokit: Octokit,
): Promise<GetForkedRepositoriesResponse> => {
  const response = await octokit.request('GET /installation/repositories', {
    per_page: 100,
  })
  return response.data.repositories.filter((repo) => {
    return repo.fork && !IGNORE_REPOS.includes(repo.full_name)
  })
}

export const getRepository = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<GetRepositoryResponse> => {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  })
  return response.data
}

export const fastForwardRepository = async (
  octokit: Octokit,
  repo: GetRepositoryResponse,
) => {
  const repoDir = await cloneRepository(repo.clone_url, repo.name)
  if (!repo.parent) throw new Error('No parent repo')
  await addUpstream(repoDir, repo.parent.clone_url)
  await fetchUpstream(repoDir)
  const branch = await getDefaultBranch(repoDir)
  await fastForwardMerge(repoDir, branch)
}
