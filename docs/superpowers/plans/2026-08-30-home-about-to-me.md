# Home About Content Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the homepage About content into the Me page without repetition, remove the obsolete homepage section and Skills navigation item, and match the homepage contact background to the former About background.

**Architecture:** Keep all content local to the page that renders it. `MePage` will own the merged biography and four skill tags, `HomePage` will no longer own biography data or an About section, and `SiteNav` will expose only valid destinations. Existing shared CSS tokens and tag styles will be reused, with two focused rules for emphasized Me-page copy and the contact background.

**Tech Stack:** React 19, TypeScript, React Router, Vitest, Testing Library, CSS custom properties, Vite

---

### Task 1: Specify the migrated content and removed homepage content

**Files:**
- Modify: `src/pages/MePage.test.tsx`
- Create: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Add a failing Me-page content test**

Append this test to `src/pages/MePage.test.tsx`:

```tsx
test('shows the merged biography and migrated skill tags', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  expect(
    screen.getByText('making complex information easier to understand and technology easier to use'),
  ).toHaveProperty('tagName', 'STRONG')
  expect(
    screen.getByText('product design, UX research, and front-end development'),
  ).toHaveProperty('tagName', 'STRONG')

  const skills = screen.getByRole('list', { name: 'Skills' })
  expect(within(skills).getAllByRole('listitem')).toHaveLength(4)
  expect(within(skills).getByText('Product design')).toBeVisible()
  expect(within(skills).getByText('UX research')).toBeVisible()
  expect(within(skills).getByText('Prototyping')).toBeVisible()
  expect(within(skills).getByText('Front-end development')).toBeVisible()
})
```

- [ ] **Step 2: Add a failing homepage removal test**

Create `src/pages/HomePage.test.tsx` with:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import { HomePage } from './HomePage'

afterEach(cleanup)

test('does not repeat About content or show a Skills navigation link', () => {
  Element.prototype.scrollIntoView = vi.fn()

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Skills' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Skills' })).not.toBeInTheDocument()
})
```

- [ ] **Step 3: Run the focused tests and verify the expected failures**

Run:

```bash
npm test -- --run src/pages/MePage.test.tsx src/pages/HomePage.test.tsx
```

Expected: the existing Me-page tests pass, while the new tests fail because the skill tags are still on the homepage, the Skills navigation link still exists, and the merged bold text has not been added to the Me page.

- [ ] **Step 4: Review the test-only diff**

```bash
git diff -- src/pages/MePage.test.tsx src/pages/HomePage.test.tsx
```

Do not commit during this task because the working tree already contains user-owned, uncommitted changes.

### Task 2: Move and rewrite the About content

**Files:**
- Modify: `src/pages/MePage.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/components/SiteNav.tsx`

- [ ] **Step 1: Replace the second Me-page introduction paragraph**

In `src/pages/MePage.tsx`, keep the existing first paragraph and replace the second paragraph with:

```tsx
<p>
  Most of my work focuses on <strong>making complex information easier to understand and technology easier to
  use</strong>. I’m especially interested in products where the consequences are real: a medical bill written in
  reason codes, a clinic booking that starts from a blank form, or public health material that has to reach people
  who didn’t choose to study it. I combine <strong>product design, UX research, and front-end development</strong> to
  explore how new technology can be genuinely useful, and I like putting a working prototype in someone’s hands
  instead of only describing one.
</p>
```

- [ ] **Step 2: Add the migrated skill tags below the Me-page introduction**

Inside `.me-intro`, immediately after the second paragraph, add:

```tsx
<ul className="skill-list" aria-label="Skills">
  <li>Product design</li>
  <li>UX research</li>
  <li>Prototyping</li>
  <li>Front-end development</li>
</ul>
```

- [ ] **Step 3: Remove the duplicated homepage About content**

In `src/pages/HomePage.tsx`, delete the `bio` constant and remove the full section whose opening tag is:

```tsx
<section className="about" id="skills" aria-labelledby="about-title">
```

The contact section should follow the works section directly.

- [ ] **Step 4: Remove the obsolete Skills navigation destination**

In `src/components/SiteNav.tsx`, delete:

```tsx
<Link to={sectionLink('skills')} onClick={(event) => scrollOnHomepage(event, 'skills')}>Skills</Link>
```

Keep Works, ME, and Contact in their existing order.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
npm test -- --run src/pages/MePage.test.tsx src/pages/HomePage.test.tsx
```

Expected: both test files pass with no warnings or errors.

- [ ] **Step 6: Review the scoped content diff**

```bash
git diff -- src/pages/MePage.tsx src/pages/HomePage.tsx src/components/SiteNav.tsx
```

Confirm that the diff contains only the planned local edits on top of the user's existing work. Do not stage or commit the files.

### Task 3: Apply the visual emphasis and contact background

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Preserve paragraph spacing and style the emphasized biography phrases**

Because the skill list becomes the final child of `.me-intro`, replace the old last-child selector and add the emphasis rule:

```css
.me-intro p:last-of-type { margin-bottom: 0; }
.me-intro strong { color: var(--ink); font-weight: 600; }
```

- [ ] **Step 2: Match the contact background to the former About section**

Change the existing `.contact` rule to:

```css
.contact { background: var(--raised); padding: var(--gap) 0 28px; }
```

Use the existing token rather than copying its hex value.

- [ ] **Step 3: Remove CSS that is now unused only by the deleted homepage About layout**

Delete these rules:

```css
.about { border-block: 1px solid var(--rule); background: var(--raised); padding: var(--gap) 0; }
.about-layout { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 24px 64px; align-items: start; }
.about-layout .section-label { margin-bottom: 0; }
.about-copy { max-width: 60ch; margin: 0; color: #35312b; font-size: 17px; line-height: 1.68; }
```

Also remove the mobile-only `.about-layout` rule. Retain the shared `.skill-list` rules because the Me page now uses them.

- [ ] **Step 4: Run static and production verification**

Run:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: all four commands exit with status 0.

- [ ] **Step 5: Run the full test suite and classify unrelated failures**

Run:

```bash
npm test -- --run
```

Expected for this change: the Me-page and homepage migration tests pass. If the existing Claimly button assertions or old Me-page biography assertion still fail, report them as pre-existing stale tests and do not modify unrelated product behavior.

- [ ] **Step 6: Review final working-tree scope**

```bash
git status --short
git diff -- src/styles.css
```

Do not stage or commit the implementation files. Preserve all unrelated worktree changes exactly as found.
