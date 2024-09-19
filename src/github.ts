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

export type GetForkedRepositoriesResponse =
  Endpoints['GET /user/repos']['response']['data']

type GetRepositoryResponse =
  Endpoints['GET /repos/{owner}/{repo}']['response']['data']

const IGNORE_REPOS = process.env.IGNORE_REPOS?.split(',') ?? []

export const getAppUserID = async (octokit: Octokit): Promise<number> => {
  const response = await octokit.request('GET /users/{username}', {
    username: 'boring-repos[bot]'
  })
  return response.data.id
}

// getForkedRepos returns all active forked repositories
export const getForkedRepos = async (
  octokit: Octokit
): Promise<GetForkedRepositoriesResponse> => {
  const response = await octokit.paginate('GET /installation/repositories', {
    per_page: 100
  })
  const repos = response.filter((repo) => {
    return repo.fork && !repo.archived && !IGNORE_REPOS.includes(repo.full_name)
  })
  console.log(
    `Found ${repos.length.toString()} forked repos: ${repos.map((r) => r.full_name).join(', ')}`
  )
  return repos
}

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
