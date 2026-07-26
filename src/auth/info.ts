import fs from 'fs'
import process from 'process'

export function getUsername(): string {
  const username = process.env.GITHUB_USERNAME
  if (!username) {
    throw new Error('GITHUB_USERNAME is not set')
  }
  return username
}

export function getAppID(): string {
  const appID = process.env.APP_ID
  if (!appID) {
    throw new Error('APP_ID is not set')
  }
  return appID
}

export function getClientID(): string {
  const clientID = process.env.CLIENT_ID
  if (!clientID) {
    throw new Error('CLIENT_ID is not set')
  }
  return clientID
}

export function getClientSecret(): string {
  const clientSecret = process.env.CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('CLIENT_SECRET is not set')
  }
  return clientSecret
}

export async function getPrivateKey(): Promise<string> {
  const privateKey = process.env.PRIVATE_KEY
  if (privateKey) {
    return privateKey
  }

  const privateKeyFile = process.env.PRIVATE_KEY_FILE
  if (privateKeyFile) {
    const buffer = await fs.promises.readFile(privateKeyFile)
    return buffer.toString()
  }

  throw new Error('either PRIVATE_KEY or PRIVATE_KEY_FILE must be set')
}
