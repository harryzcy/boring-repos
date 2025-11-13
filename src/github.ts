import { Endpoints } from '@octokit/types'
import { RequestError } from '@octokit/request-error'
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
export const REPO_LABELS = [
  {
    name: 'bug',
    color: 'd73a4a',
    description: "Something isn't working"
  },
  {
    name: 'chore',
    color: '44b274',
    description: 'Maintenance'
  },
  {
    name: 'dependencies',
    color: 'ededed',
    description: 'Dependencies'
  },
  {
    name: 'enhancement',
    color: 'a2eeef',
    description: 'New feature or request'
  },
  {
    name: 'skip-changelog',
    color: 'bfdadc',
    description: 'Do not include in changelog'
  },
  {
    name: 'wontfix',
    color: 'ffffff',
    description: 'This will not be worked on'
  }
]

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
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (err) {
    const error = err as RequestError
    console.error(`Error getting repository ${owner}/${repo}`)
    console.error({
      status: error.status,
      response: error.response
    })
    return {
      success: false,
      status: error.status,
      data: error.response?.data
    }
  }
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

interface RepositoryLabel {
  name: string
  color: string
  description: string | null
}

export type GetRepositoryLabelsResponse = RepositoryLabel[]

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

export const updateRepositoryLabels = async (
  octokit: Octokit,
  owner: string,
  repo: string
) => {
  const labels = await getRepositoryLabels(octokit, owner, repo)
  const labelNames: Record<string, RepositoryLabel> = {}
  for (const label of labels) {
    labelNames[label.name] = label
  }

  let created = 0
  let updated = 0
  for (const label of REPO_LABELS) {
    if (!(label.name in labelNames)) {
      await createRepositoryLabel(octokit, owner, repo, label)
      created += 1
    } else {
      const currentLabel = labelNames[label.name]
      if (
        currentLabel.color !== label.color ||
        currentLabel.description !== label.description
      ) {
        await updateRepositoryLabel(octokit, owner, repo, label)
        updated += 1
      }
    }
  }
  console.log(
    `Created ${created.toString()} and updated ${updated.toString()} labels for ${owner}/${repo}`
  )
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
