import type { Endpoints } from '@octokit/types'
import type { Octokit } from 'octokit'
import { RequestError } from '@octokit/request-error'

import {
  addUpstream,
  checkIfBranchExists,
  cloneRepository,
  deleteDirectory,
  fastForwardMerge,
  fetchUpstream,
  getDefaultBranch,
  pushChanges,
  pushTags,
  updateCommitter
} from './git.js'

const IGNORE_REPOS = process.env.IGNORE_REPOS?.split(',') ?? []

export const getAppUserID = async (
  octokit: Octokit
): Promise<number | bigint> => {
  const response = await octokit.request('GET /users/{username}', {
    username: 'boring-repos[bot]'
  })
  return response.data.id
}

export interface GetRepositoriesParams {
  isFork?: boolean
}
export type GetRepositoriesResponse =
  Endpoints['GET /user/repos']['response']['data']

// GetRepositories returns all repositories, optionally filtering by fork status
export const getRepositories = async (
  octokit: Octokit,
  { isFork }: GetRepositoriesParams
): Promise<GetRepositoriesResponse> => {
  const response = await octokit.paginate('GET /installation/repositories', {
    per_page: 100
  })
  let repos = response.filter(
    (repo) => !repo.archived && !IGNORE_REPOS.includes(repo.full_name)
  )
  if (typeof isFork === 'boolean') {
    repos = repos.filter((repo) => repo.fork === isFork)
  }
  console.log(
    `Found ${repos.length.toString()} forked repos: ${repos.map((repo) => repo.full_name).join(', ')}`
  )
  return repos
}

type GetRepositoryResponse =
  Endpoints['GET /repos/{owner}/{repo}']['response']['data']

interface GetRepositorySuccess {
  success: true
  data: GetRepositoryResponse
  status: number
}

interface GetRepositoryFailure {
  success: false
  data: unknown
  status: number
}

type GetRepositoryResult = GetRepositorySuccess | GetRepositoryFailure

export const getRepository = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GetRepositoryResult> => {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo
    })
    return {
      data: response.data,
      status: response.status,
      success: true
    }
  } catch (error) {
    if (!(error instanceof RequestError)) {
      throw error
    }
    console.error(`Error getting repository ${owner}/${repo}`)
    console.error({
      response: error.response,
      status: error.status
    })
    return {
      data: error.response?.data,
      status: error.status,
      success: false
    }
  }
}

// oxlint-disable-next-line max-statements
export const fastForwardRepository = async (
  repo: GetRepositoryResponse,
  token: string,
  appUserID: number | bigint
) => {
  console.log(`Fast-forwarding ${repo.full_name}`)
  try {
    const cloneURL = repo.clone_url.replace(
      'https://',
      `https://x-oauth-basic:${token}@`
    )
    const repoDir = await cloneRepository(cloneURL, repo.name)
    await updateCommitter(repoDir, appUserID)

    if (!repo.parent) {
      throw new Error('No parent repo')
    }
    await addUpstream(repoDir, repo.parent.clone_url)
    await fetchUpstream(repoDir)

    const allowedBranches = ['main', 'master', 'dev', 'v2']
    let branch = ''
    for (branch of allowedBranches) {
      if (await checkIfBranchExists(repoDir, branch)) {
        break
      }
    }
    if (branch === '') {
      branch = await getDefaultBranch(repoDir)
      throw new Error(`Unexpected default branch: ${branch}`)
    }

    await fastForwardMerge(repoDir, branch)
    await pushChanges(repoDir, branch)
    await pushTags(repoDir)
    await deleteDirectory(repoDir)
  } catch (error) {
    console.error(`Failed to fast-forward ${repo.full_name}`, error)
  }
}
