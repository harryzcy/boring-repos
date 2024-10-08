import { exec } from 'child_process'
import fs from 'fs'

const TEMP_DIR = process.env.TEMP_DIR ?? '/tmp'
const APP_NAME = 'boring-repos[bot]'

export const runCommand = async (
  cmd: string,
  options?: {
    workingDir?: string
    env?: NodeJS.ProcessEnv
    hideError?: boolean
  }
): Promise<string> => {
  return new Promise(function (resolve, reject) {
    exec(
      cmd,
      {
        cwd: options?.workingDir,
        env: options?.env,
        maxBuffer: 1024 * 1024 // 1MB
      },
      function (err, stdout, stderr) {
        if (err && !options?.hideError) {
          reject(err)
          return
        }
        if (stdout !== '') console.log(stdout)
        if (stderr !== '') console.error(stderr)
        resolve(stdout || stderr)
      }
    )
  })
}

export const cloneRepository = async (gitURL: string, repoName: string) => {
  const ts = Math.floor(Date.now() / 1000)
  const targetDir = `${TEMP_DIR}/${repoName}-${ts.toString()}`
  await runCommand(`git clone ${gitURL} ${targetDir}`)
  return targetDir
}

export const updateCommitter = async (repoDir: string, appUserID: number) => {
  await runCommand(`git -C ${repoDir} config user.name ${APP_NAME}`)
  await runCommand(
    `git -C ${repoDir} config user.email "${appUserID.toString()}+${APP_NAME}@users.noreply.github.com"`
  )
}

export const addUpstream = async (repoDir: string, upstreamURL: string) => {
  await runCommand(`git -C ${repoDir} remote add upstream ${upstreamURL}`)
}

export const fetchUpstream = async (repoDir: string) => {
  await runCommand(`git -C ${repoDir} fetch upstream`)
}

export const checkIfBranchExists = async (repoDir: string, branch: string) => {
  const output = await runCommand(
    `git -C ${repoDir} show-ref refs/heads/${branch}`,
    {
      hideError: true
    }
  )
  return output !== ''
}

export const getDefaultBranch = async (repoDir: string) => {
  const branch = await runCommand(
    `git -C ${repoDir} rev-parse --abbrev-ref HEAD`
  )
  return branch.trim()
}

export const fastForwardMerge = async (repoDir: string, branch: string) => {
  await runCommand(`git -C ${repoDir} merge --ff-only upstream/${branch}`)
}

export const pushChanges = async (repoDir: string, branch: string) => {
  await runCommand(`git -C ${repoDir} push origin ${branch}`)
}

export const pushTags = async (repoDir: string) => {
  await runCommand(`git -C ${repoDir} push --tags`)
}

export const deleteDirectory = async (repoDir: string) => {
  await fs.promises.rm(repoDir, { recursive: true })
}
