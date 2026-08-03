import { exec } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

// Promisify special-cases exec's ChildProcess return; tsc accepts the result
// oxlint-disable-next-line typescript/strict-void-return
const execAsync = promisify(exec)

const TEMP_DIR = process.env.TEMP_DIR ?? '/tmp'
const APP_NAME = 'boring-repos[bot]'

interface CommandOutput {
  stdout: string
  stderr: string
}

interface RunCommandOptions {
  workingDir?: string
  env?: NodeJS.ProcessEnv
  hideError?: boolean
}

// A rejected execAsync carries the captured output on the error itself
const hasCapturedOutput = (error: unknown): error is CommandOutput =>
  typeof error === 'object' &&
  error !== null &&
  'stdout' in error &&
  'stderr' in error

const execCapturing = async (
  cmd: string,
  options?: RunCommandOptions
): Promise<CommandOutput> => {
  try {
    return await execAsync(cmd, {
      cwd: options?.workingDir,
      env: options?.env,
      // 1MB
      // oxlint-disable-next-line no-magic-numbers
      maxBuffer: 1024 * 1024
    })
  } catch (error) {
    if (!(options?.hideError ?? false) || !hasCapturedOutput(error)) {
      throw error
    }
    return { stderr: error.stderr, stdout: error.stdout }
  }
}

export const runCommand = async (
  cmd: string,
  options?: RunCommandOptions
): Promise<string> => {
  const { stdout, stderr } = await execCapturing(cmd, options)

  if (stdout !== '') {
    console.log(stdout)
  }
  if (stderr !== '') {
    console.error(stderr)
  }
  return stdout || stderr
}

export const cloneRepository = async (gitURL: string, repoName: string) => {
  // oxlint-disable-next-line no-magic-numbers
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
