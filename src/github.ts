import { Endpoints } from '@octokit/types'
import { Octokit } from 'octokit'
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

export const getAppUserID = async (octokit: Octokit): Promise<number> => {
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

// getRepositories returns all repositories, optionally filtering by fork status
export const getRepositories = async (
  octokit: Octokit,
  { isFork }: GetRepositoriesParams
): Promise<GetRepositoriesResponse> => {
  const response = await octokit.paginate('GET /installation/repositories', {
    per_page: 100
  })
  let repos = response.filter((repo) => {
    return !repo.archived && !IGNORE_REPOS.includes(repo.full_name)
  })
  if (isFork !== undefined) {
    repos = repos.filter((repo) => repo.fork === isFork)
  }
  console.log(
    `Found ${repos.length.toString()} forked repos: ${repos.map((r) => r.full_name).join(', ')}`
  )
  return repos
}

type GetRepositoryResponse =
  Endpoints['GET /repos/{owner}/{repo}']['response']['data']

export const getRepository = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GetRepositoryResponse> => {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo
  })
  return response.data
}

export const fastForwardRepository = async (
  repo: GetRepositoryResponse,
  token: string,
  appUserID: number
) => {
  console.log(`Fast-forwarding ${repo.full_name}`)
  try {
    const cloneURL = repo.clone_url.replace(
      'https://',
      `https://x-oauth-basic:${token}@`
    )
    const repoDir = await cloneRepository(cloneURL, repo.name)
    await updateCommitter(repoDir, appUserID)

    if (!repo.parent) throw new Error('No parent repo')
    await addUpstream(repoDir, repo.parent.clone_url)
    await fetchUpstream(repoDir)

    const allowedBranches = ['main', 'master', 'dev', 'v2']
    let branch: string | null = null
    for (branch of allowedBranches) {
      if (await checkIfBranchExists(repoDir, branch)) {
        break
      }
    }
    if (!branch) {
      branch = await getDefaultBranch(repoDir)
      throw new Error(`Unexpected default branch: ${branch}`)
    }

    await fastForwardMerge(repoDir, branch)
    await pushChanges(repoDir, branch)
    await pushTags(repoDir)
    await deleteDirectory(repoDir)
  } catch (e) {
    console.error(`Failed to fast-forward ${repo.full_name}`, e)
  }
}

export type GetRepositoryLabelsResponse = {
  name: string
  color: string
  description: string | null
}[]

export const getRepositoryLabels = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GetRepositoryLabelsResponse> => {
  const response = await octokit.request('GET /repos/{owner}/{repo}/labels', {
    owner,
    repo
  })
  return response.data.map((label) => ({
    name: label.name,
    color: label.color,
    description: label.description
  }))
}

export interface UpdateRepositoryLabelParams {
  name: string
  newName?: string
  color: string
  description?: string
}

export const updateRepositoryLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  { name, newName, color, description }: UpdateRepositoryLabelParams
) => {
  await octokit.request('PATCH /repos/{owner}/{repo}/labels/{name}', {
    owner,
    repo,
    name,
    new_name: newName,
    description: description,
    color: color
  })
}

export interface CreateRepositoryLabelParams {
  name: string
  color: string
  description?: string
}

export const createRepositoryLabel = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  { name, color, description }: CreateRepositoryLabelParams
) => {
  await octokit.request('POST /repos/{owner}/{repo}/labels', {
    owner,
    repo,
    name,
    description,
    color
  })
}
