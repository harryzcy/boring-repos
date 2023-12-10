import fs from 'fs'

export async function getPrivateKey(): Promise<string> {
  if (!process.env.PRIVATE_KEY_FILE) {
    throw new Error('PRIVATE_KEY_FILE is not set')
  }
  const buffer = await fs.promises.readFile(process.env.PRIVATE_KEY_FILE)
  return buffer.toString()
}

export function getAppID(): string {
  if (!process.env.APP_ID) {
    throw new Error('APP_ID is not set')
  }
  return process.env.APP_ID
}

export function getUsername(): string {
  if (!process.env.GITHUB_USERNAME) {
    throw new Error('GITHUB_USERNAME is not set')
  }
  return process.env.GITHUB_USERNAME
}

export function getInstallationID(): number {
  if (!process.env.GITHUB_USERNAME) {
    throw new Error('GITHUB_USERNAME is not set')
  }
  return Number(process.env.INSTALLATION_ID)
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
