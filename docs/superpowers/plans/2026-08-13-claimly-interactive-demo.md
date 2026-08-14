# Claimly Interactive Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed the existing Claimly Expo web demo in the Claimly portfolio project dialog without recreating its interaction.

**Architecture:** The portfolio copies Claimly's static Expo export into `public/demos/claimly` and rewrites its root Expo asset URLs to the nested public path. Claimly project metadata opts into a focused `MobileDemoFrame`, which owns iframe loading feedback and a direct-link fallback while the dialog retains modal behavior.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, CSS, Node.js filesystem APIs.

---

## File structure

- Create: `scripts/prepare-claimly-demo.mjs` — copies the known Claimly Expo export and rewrites static HTML asset URLs for nested hosting.
- Create: `src/components/MobileDemoFrame.tsx` — reusable iframe frame with loading and direct-link affordances.
- Modify: `src/components/ProjectDialog.tsx` — renders an optional mobile demo after project summary.
- Modify: `src/pages/HomePage.tsx` — supplies Claimly demo metadata.
- Modify: `src/styles.css` — styles the expanded dialog and phone frame responsively.
- Modify: `src/App.test.tsx` — covers the Claimly embedded-demo contract and preserves modal dismissal coverage.
- Modify: `package.json` — adds deterministic demo-preparation and production build scripts.

### Task 1: Add the embedded-demo regression test

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Add this test after the existing Claimly dialog test:

```tsx
test('embeds the Claimly prototype and provides a direct demo link', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(screen.getByRole('button', { name: /Claimly project/i }))

  expect(screen.getByTitle('Claimly interactive prototype')).toHaveAttribute('src', '/demos/claimly/')
  expect(screen.getByRole('link', { name: 'Open Claimly demo' })).toHaveAttribute('href', '/demos/claimly/')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because neither the named iframe nor link exists.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/App.test.tsx
git commit -m "test: cover Claimly demo embed"
```

### Task 2: Add an isolated mobile-demo frame

**Files:**
- Create: `src/components/MobileDemoFrame.tsx`
- Modify: `src/components/ProjectDialog.tsx`

- [ ] **Step 1: Create the frame component**

```tsx
import { useState } from 'react'

type MobileDemoFrameProps = {
  title: string
  url: string
}

export function MobileDemoFrame({ title, url }: MobileDemoFrameProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <section className="mobile-demo" aria-label={`${title} demo`}>
      <div className="mobile-demo__frame">
        {isLoading && <p className="mobile-demo__status">Loading interactive prototype…</p>}
        <iframe
          className="mobile-demo__iframe"
          title={`${title} interactive prototype`}
          src={url}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <a className="mobile-demo__link" href={url} target="_blank" rel="noreferrer">Open {title} demo <span aria-hidden="true">↗</span></a>
    </section>
  )
}
```

- [ ] **Step 2: Extend project metadata and dialog rendering**

Add `demo?: { url: string }` to `Project`. Import `MobileDemoFrame` in `ProjectDialog`, and replace the dialog interior with:

```tsx
<section
  className="project-dialog"
  aria-labelledby="project-dialog-title"
  aria-modal="true"
  onMouseDown={(event) => event.stopPropagation()}
  role="dialog"
>
  <div className="project-dialog__content">
    <div>
      <p className="eyebrow">{project.category}</p>
      <h2 id="project-dialog-title">{project.name} project details</h2>
      <p>{project.summary}</p>
      <button className="dialog-close" ref={closeButtonRef} type="button" onClick={onClose}>Close</button>
    </div>
    {project.demo && <MobileDemoFrame title={project.name} url={project.demo.url} />}
  </div>
</section>
```

- [ ] **Step 3: Add Claimly metadata**

Add the following property to the Claimly project object in `src/pages/HomePage.tsx`:

```tsx
demo: { url: '/demos/claimly/' },
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- --run src/App.test.tsx`

Expected: PASS, including the new iframe and direct-link assertions.

- [ ] **Step 5: Commit the UI behavior**

```bash
git add src/components/MobileDemoFrame.tsx src/components/ProjectDialog.tsx src/pages/HomePage.tsx src/App.test.tsx
git commit -m "feat: embed Claimly interactive demo"
```

### Task 3: Style the responsive case-study frame

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add the dialog and demo styles**

Replace the existing `.project-dialog` rule and add these rules directly after `.dialog-close:hover`:

```css
.project-dialog { width: min(100%, 840px); background: white; padding: 36px; box-shadow: 0 18px 60px rgb(0 0 0 / .3); }
.project-dialog__content { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 320px); gap: 36px; align-items: center; }
.mobile-demo { min-width: 0; }
.mobile-demo__frame { position: relative; aspect-ratio: 9 / 18.5; overflow: hidden; border: 8px solid #212121; border-radius: 28px; background: #212121; box-shadow: 0 16px 32px rgb(9 9 26 / .2); }
.mobile-demo__iframe { width: 100%; height: 100%; border: 0; background: white; }
.mobile-demo__status { position: absolute; z-index: 1; inset: 0; display: grid; place-items: center; margin: 0; padding: 24px; background: #212121; color: white; font: 400 10px/1.5 'DM Mono', monospace; letter-spacing: .1em; text-align: center; text-transform: uppercase; }
.mobile-demo__link { display: flex; justify-content: space-between; margin-top: 12px; color: var(--accent); font: 500 10px/1.4 'DM Mono', monospace; letter-spacing: .1em; text-decoration: none; text-transform: uppercase; }
```

- [ ] **Step 2: Add narrow-screen behavior**

Add these rules inside the existing `@media (max-width: 680px)` block:

```css
.project-dialog { padding: 24px; }
.project-dialog__content { grid-template-columns: 1fr; gap: 28px; }
.mobile-demo__frame { width: min(100%, 320px); margin-inline: auto; }
```

- [ ] **Step 3: Run type checking and focused tests**

Run: `npm run typecheck && npm test -- --run src/App.test.tsx`

Expected: both commands exit 0.

- [ ] **Step 4: Commit the responsive styling**

```bash
git add src/styles.css
git commit -m "style: frame Claimly mobile demo"
```

### Task 4: Stage Claimly's static Expo export for nested hosting

**Files:**
- Create: `scripts/prepare-claimly-demo.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the staging script**

Create this script:

```js
import { access, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, '../Claimly/.worktrees/claimly-demo/dist')
const destination = resolve(root, 'public/demos/claimly')

try {
  await access(source, constants.R_OK)
} catch {
  throw new Error(`Claimly static export was not found at ${source}`)
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
```

- [ ] **Step 2: Add package scripts**

Replace the existing build script with:

```json
"prepare:claimly-demo": "node scripts/prepare-claimly-demo.mjs",
"build": "npm run prepare:claimly-demo && tsc -b && vite build"
```

- [ ] **Step 3: Run the staging script and assert the nested asset path**

Run: `npm run prepare:claimly-demo && rg -n 'src="/demos/claimly/_expo/' public/demos/claimly/index.html`

Expected: command exits 0 and prints Claimly's rewritten Expo entry-script URL.

- [ ] **Step 4: Build the portfolio**

Run: `npm run build`

Expected: command exits 0 and `dist/demos/claimly/index.html` exists.

- [ ] **Step 5: Commit staged-demo tooling**

```bash
git add package.json package-lock.json scripts/prepare-claimly-demo.mjs
git commit -m "build: stage Claimly demo with portfolio"
```

### Task 5: Full verification

**Files:**
- Verify: `src/App.test.tsx`
- Verify: `src/components/MobileDemoFrame.tsx`
- Verify: `public/demos/claimly/index.html`

- [ ] **Step 1: Run the complete portfolio verification suite**

Run: `npm test -- --run && npm run typecheck && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 2: Manually inspect the app**

Run: `npm run dev -- --host 127.0.0.1`

Expected: opening the local URL, selecting Claimly, and using the embedded flow shows the original Claimly application inside the phone frame. The direct link opens `/demos/claimly/` in a new tab.

- [ ] **Step 3: Commit any verification corrections**

```bash
git add src/App.test.tsx src/components/MobileDemoFrame.tsx src/components/ProjectDialog.tsx src/pages/HomePage.tsx src/styles.css package.json package-lock.json scripts/prepare-claimly-demo.mjs
git commit -m "fix: finalize Claimly demo integration"
```
