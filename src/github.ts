import { Endpoints } from '@octokit/types'
import { Octokit } from 'octokit'

export type GetForkedRepositoriesResponse =
  Endpoints['GET /user/repos']['response']['data']

export async function getForkedRepos(
  octokit: Octokit,
): Promise<GetForkedRepositoriesResponse> {
  const response = await octokit.request('GET /installation/repositories', {
    per_page: 100,
  })
  return response.data.repositories.filter((repo) => repo.fork)
}
