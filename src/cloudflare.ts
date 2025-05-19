import Cloudflare from 'cloudflare'
import fs from 'node:fs'
import { Octokit } from 'octokit'
import { NODE_VERSION } from './dependencies.js'
import { cloneRepository, runCommand } from './git.js'
import { getRepository } from './github.js'

const cloudflare = new Cloudflare()

export const getCloudflareAccountID = () => {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
  }
  return process.env.CLOUDFLARE_ACCOUNT_ID
}

export const updateNodeVersion = async (accountID: string) => {
  const projects = ['harryzcy-github-io']
  for (const project of projects) {
    await cloudflare.pages.projects.edit(project, {
      account_id: accountID,
      deployment_configs: {
        production: {
          env_vars: {
            NODE_VERSION: {
              type: 'plain_text',
              value: NODE_VERSION
            }
          }
        },
        preview: {
          env_vars: {
            NODE_VERSION: {
              type: 'plain_text',
              value: NODE_VERSION
            }
          }
        }
      }
    })
  }
}

export const deployServerlessRegistry = async (
  octokit: Octokit,
  accountID: string,
  apiToken: string
) => {
  const repo = await getRepository(octokit, 'harryzcy', 'serverless-registry')

  const repoDir = await cloneRepository(repo.clone_url, repo.name)

  const wranglerConfig = await fs.promises.readFile(
    `config/serverless-registry.toml`,
    'utf8'
  )
  await fs.promises.writeFile(`${repoDir}/wrangler.toml`, wranglerConfig)

  await runCommand(`npm install`, {
    workingDir: repoDir
  })

  await runCommand(`npx wrangler deploy --env production`, {
    workingDir: repoDir,
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountID,
      CLOUDFLARE_API_TOKEN: apiToken
    }
  })
}

export const rollAPIToken = async () => {
  // TODO: Implement this
}
