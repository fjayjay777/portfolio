import { access, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(root, 'public/demos/claimly')
const sourceCandidates = [
  resolve(root, '../Claimly/.worktrees/claimly-demo/dist'),
  resolve(root, '../../../Claimly/.worktrees/claimly-demo/dist'),
]

let source

for (const candidate of sourceCandidates) {
  try {
    await access(candidate, constants.R_OK)
    source = candidate
    break
  } catch {
    // Try the next checkout layout.
  }
}

if (!source) {
  throw new Error(`Claimly static export was not found at ${sourceCandidates.join(' or ')}`)
}

await rm(destination, { recursive: true, force: true })
await mkdir(destination, { recursive: true })
await cp(source, destination, { recursive: true })

async function rewriteHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name)
    if (entry.isDirectory()) await rewriteHtml(file)
    if (entry.isFile() && entry.name.endsWith('.html')) {
      const contents = await readFile(file, 'utf8')
      await writeFile(file, contents.replaceAll('src="/_expo/', 'src="/demos/claimly/_expo/'))
    }
  }
}

await rewriteHtml(destination)
