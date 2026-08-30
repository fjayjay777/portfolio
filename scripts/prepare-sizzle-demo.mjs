import { access, cp, mkdir, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFile = promisify(execFileCallback)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(root, 'public/demos/sizzle')
const basePath = '/demos/sizzle/'
const sourceCandidates = [
  resolve(root, '../sizzle'),
  resolve(root, '../../../sizzle'),
  resolve(root, '../sizzle/.worktrees/sizzle-demo'),
  resolve(root, '../../../sizzle/.worktrees/sizzle-demo'),
]

let sourceRoot

for (const candidate of sourceCandidates) {
  try {
    await access(resolve(candidate, 'package.json'), constants.R_OK)
    sourceRoot = candidate
    break
  } catch {
    // Try the next checkout layout.
  }
}

if (!sourceRoot) {
  throw new Error(`Sizzle project was not found at ${sourceCandidates.join(' or ')}`)
}

// Vite reads VITE_BASE_PATH for `base`, which rewrites asset URLs and feeds
// import.meta.env.BASE_URL — the router picks that up as its basename.
await execFile('npm', ['run', 'build'], {
  cwd: sourceRoot,
  env: { ...process.env, VITE_BASE_PATH: basePath },
})

const source = resolve(sourceRoot, 'dist')
await rm(destination, { recursive: true, force: true })
await mkdir(destination, { recursive: true })
await cp(source, destination, { recursive: true })
