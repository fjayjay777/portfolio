import { defineConfig } from 'vitest/config'
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
  ],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
})
