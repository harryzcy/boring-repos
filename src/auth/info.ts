import fs from 'fs'

export function getUsername(): string {
  if (!process.env.GITHUB_USERNAME) {
    throw new Error('GITHUB_USERNAME is not set')
  }
  return process.env.GITHUB_USERNAME
}

export function getAppID(): string {
  if (!process.env.APP_ID) {
    throw new Error('APP_ID is not set')
  }
  return process.env.APP_ID
}

export function getClientID(): string {
  if (!process.env.CLIENT_ID) {
    throw new Error('CLIENT_ID is not set')
  }
  return process.env.CLIENT_ID
}

export function getClientSecret(): string {
  if (!process.env.CLIENT_SECRET) {
    throw new Error('CLIENT_SECRET is not set')
  }
  return process.env.CLIENT_SECRET
}

export async function getPrivateKey(): Promise<string> {
  if (process.env.PRIVATE_KEY) {
    return process.env.PRIVATE_KEY
  }

  if (process.env.PRIVATE_KEY_FILE) {
    const buffer = await fs.promises.readFile(process.env.PRIVATE_KEY_FILE)
    return buffer.toString()
  }

  throw new Error('either PRIVATE_KEY or PRIVATE_KEY_FILE must be set')
}
