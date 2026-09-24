import { access, cp, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFile = promisify(execFileCallback)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(root, 'public/demos/claimly')
const sourceCandidates = [
  resolve(root, '../Claimly'),
  resolve(root, '../../../Claimly'),
  resolve(root, '../Claimly/.worktrees/claimly-demo'),
  resolve(root, '../../../Claimly/.worktrees/claimly-demo'),
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
  throw new Error(`Claimly project was not found at ${sourceCandidates.join(' or ')}`)
}

await execFile('npx', ['expo', 'export', '--platform', 'web'], {
  cwd: sourceRoot,
  env: { ...process.env, CLAIMLY_BASE_URL: '/demos/claimly' },
})

const source = resolve(sourceRoot, 'dist')
await rm(destination, { recursive: true, force: true })
await mkdir(destination, { recursive: true })
await cp(source, destination, { recursive: true })

// Expo exports package assets (the Poppins fonts, router icons) under
// assets/node_modules. The repo ignores every node_modules folder, so those files
// never reached Git and the deployed demo hung waiting for its fonts. Serve them
// from assets/vendor instead and point the bundle there.
await rename(resolve(destination, 'assets/node_modules'), resolve(destination, 'assets/vendor'))

async function rewriteExport(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name)
    if (entry.isDirectory()) await rewriteExport(file)
    if (!entry.isFile()) continue
    if (entry.name.endsWith('.html')) {
      const contents = await readFile(file, 'utf8')
      await writeFile(file, contents.replaceAll('src="/_expo/', 'src="/demos/claimly/_expo/'))
    }
    if (entry.name.endsWith('.js')) {
      const contents = await readFile(file, 'utf8')
      await writeFile(file, contents.replaceAll('/demos/claimly/assets/node_modules/', '/demos/claimly/assets/vendor/'))
    }
  }
}

await rewriteExport(destination)
