import fs from 'fs'
import process from 'process'

interface Env {
  GITHUB_USERNAME?: string
  APP_ID?: string
  CLIENT_ID?: string
  CLIENT_SECRET?: string
  PRIVATE_KEY?: string
  PRIVATE_KEY_FILE?: string
}

function getEnv(): Env {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const env = process.env as unknown as Env
  return env
}

export function getUsername(): string {
  const username = getEnv().GITHUB_USERNAME
  if (!username) {
    throw new Error('GITHUB_USERNAME is not set')
  }
  return username
}

export function getAppID(): string {
  const appID = getEnv().APP_ID
  if (!appID) {
    throw new Error('APP_ID is not set')
  }
  return appID
}

export function getClientID(): string {
  const clientID = getEnv().CLIENT_ID
  if (!clientID) {
    throw new Error('CLIENT_ID is not set')
  }
  return clientID
}

export function getClientSecret(): string {
  const clientSecret = getEnv().CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('CLIENT_SECRET is not set')
  }
  return clientSecret
}

export async function getPrivateKey(): Promise<string> {
  const privateKey = getEnv().PRIVATE_KEY
  if (privateKey) {
    return privateKey
  }

  const privateKeyFile = getEnv().PRIVATE_KEY_FILE
  if (privateKeyFile) {
    const buffer = await fs.promises.readFile(privateKeyFile)
    return buffer.toString()
  }

  throw new Error('either PRIVATE_KEY or PRIVATE_KEY_FILE must be set')
}
