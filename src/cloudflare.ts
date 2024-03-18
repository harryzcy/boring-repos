import Cloudflare from 'cloudflare'
import { NODE_VERSION } from './dependencies.js'

const cloudflare = new Cloudflare()

export const getCloudflareAccountID = async () => {
  const allAccounts = []
  for await (const accountListResponse of cloudflare.accounts.list()) {
    allAccounts.push(accountListResponse)
  }
  const account = allAccounts[0] as { id: string }
  return account.id
}

export const updateNodeVersion = async (accountID: string) => {
  const projects = ['harryzcy-github-io']
  for (const project of projects) {
    await cloudflare.pages.projects.edit(project, {
      account_id: accountID,
      body: {
        deployment_configs: {
          production: {
            env_vars: {
              NODE_VERSION: {
                value: NODE_VERSION,
              },
            },
          },
          preview: {
            env_vars: {
              NODE_VERSION: {
                value: NODE_VERSION,
              },
            },
          },
        },
      },
    })
  }
}
