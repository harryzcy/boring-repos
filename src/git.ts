import { exec } from 'child_process'

const TEMP_DIR = process.env.TEMP_DIR ?? '/tmp'
const APP_NAME = 'boring-repos[bot]'

const runCommand = async (cmd: string): Promise<string> => {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (err, stdout, stderr) {
      if (err) return reject(err)
      if (stdout !== '') console.log(stdout)
      if (stderr !== '') console.error(stderr)
      resolve(stdout || stderr)
    })
  })
}

export const cloneRepository = async (gitURL: string, repoName: string) => {
  console.log(`Cloning ${gitURL} into ${TEMP_DIR}`)

  const ts = Math.floor(Date.now() / 1000)
  const targetDir = `${TEMP_DIR}/${repoName}-${ts}`
  await runCommand(`git clone ${gitURL} ${targetDir}`)
  return targetDir
}

export const updateCommitter = async (repoDir: string, appUserID: number) => {
  await runCommand(`git -C ${repoDir} config user.name ${APP_NAME}`)
  await runCommand(
    `git -C ${repoDir} config user.email "${appUserID}+${APP_NAME}@users.noreply.github.com"`,
  )
}

export const addUpstream = async (repoDir: string, upstreamURL: string) => {
  await runCommand(`git -C ${repoDir} remote add upstream ${upstreamURL}`)
}

export const fetchUpstream = async (repoDir: string) => {
  await runCommand(`git -C ${repoDir} fetch upstream`)
}

export const getDefaultBranch = async (repoDir: string) => {
  const branch = await runCommand(
    `git -C ${repoDir} rev-parse --abbrev-ref HEAD`,
  )
  return branch.trim()
}

export const fastForwardMerge = async (repoDir: string, branch: string) => {
  await runCommand(`git -C ${repoDir} merge --ff-only upstream/${branch}`)
}

export const pushChanges = async (repoDir: string, branch: string) => {
  await runCommand(`git -C ${repoDir} push origin ${branch}`)
}
