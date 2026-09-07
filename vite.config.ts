import { configDefaults, defineConfig } from 'vitest/config'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-claimly-demo-root',
      configureServer(server) {
        const entry = resolve(root, 'public/demos/claimly/index.html')

        server.middlewares.use('/demos/claimly/', async (request, response, next) => {
          if (request.url !== '/' && request.url !== '') return next()

          try {
            response.setHeader('Content-Type', 'text/html')
            response.end(await readFile(entry))
          } catch {
            next()
          }
        })
      },
    },
    {
      // Medisync is a client-routed SPA, so every non-asset path under its
      // base has to fall back to the demo's own index.html.
      name: 'serve-medisync-demo',
      configureServer(server) {
        const entry = resolve(root, 'public/demos/medisync/index.html')

        server.middlewares.use('/demos/medisync', async (request, response, next) => {
          const path = (request.url ?? '/').split('?')[0]
          if (path.includes('.')) return next()

          try {
            response.setHeader('Content-Type', 'text/html')
            response.end(await readFile(entry))
          } catch {
            next()
          }
        })
      },
    },
    {
      // Sizzle is client-routed too, so it needs the same fallback.
      name: 'serve-sizzle-demo',
      configureServer(server) {
        const entry = resolve(root, 'public/demos/sizzle/index.html')

        server.middlewares.use('/demos/sizzle', async (request, response, next) => {
          const path = (request.url ?? '/').split('?')[0]
          if (path.includes('.')) return next()

          try {
            response.setHeader('Content-Type', 'text/html')
            response.end(await readFile(entry))
          } catch {
            next()
          }
        })
      },
    },
  ],
  // .worktrees holds other branches' checkouts; running their suites from here
  // reports failures that have nothing to do with this working tree.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
  },
})
