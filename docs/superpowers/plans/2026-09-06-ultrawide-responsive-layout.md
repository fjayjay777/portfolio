# Ultrawide Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage, Me page, contact section, and case studies feel proportionate on 1440px-and-wider displays while preserving the current mobile and standard desktop layouts.

**Architecture:** Keep the existing React markup and add one desktop-only scaling layer to the shared stylesheet. A small Vitest contract test reads the stylesheet and locks the new breakpoint, shared shell cap, hero behavior, readable prose measure, and phone-frame cap so future CSS edits do not silently remove the large-screen behavior.

**Tech Stack:** React 19, TypeScript, CSS custom properties and media queries, Vite, Vitest, Testing Library

---

## File map

- Create `src/styles.test.ts` to define the static CSS contract for the ultrawide layer.
- Modify `src/styles.css` to add the ultrawide breakpoint and fluid component scales.
- Do not change React page components. Their existing shared classes already provide the needed boundaries.

### Task 1: Add and implement the ultrawide CSS contract

**Files:**
- Create: `src/styles.test.ts`
- Modify: `src/styles.css`
- Test: `src/styles.test.ts`

- [ ] **Step 1: Write the failing stylesheet contract test**

Create `src/styles.test.ts` with:

```ts
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

test('adds a bounded ultrawide layout layer without changing smaller breakpoints', () => {
  const ultrawideStart = styles.indexOf('@media (min-width: 1440px)')
  const tabletStart = styles.indexOf('@media (max-width: 900px)')

  expect(ultrawideStart).toBeGreaterThan(-1)
  expect(tabletStart).toBeGreaterThan(ultrawideStart)

  const ultrawide = styles.slice(ultrawideStart, tabletStart)

  expect(ultrawide).toContain('clamp(1080px, 75vw, 1440px)')
  expect(ultrawide).toContain('min-height: calc(100svh - var(--nav-height))')
  expect(ultrawide).toContain('.case-body { max-width: 74ch; }')
  expect(ultrawide).toContain('.mobile-demo { width: min(100%, 340px); }')
})
```

- [ ] **Step 2: Run the focused test and verify that it fails for the missing breakpoint**

Run: `npm test -- --run src/styles.test.ts`

Expected: FAIL because `ultrawideStart` is `-1`.

- [ ] **Step 3: Add the ultrawide scaling layer**

Insert this block in `src/styles.css` immediately before the existing `@media (max-width: 900px)` block:

```css
@media (min-width: 1440px) {
  :root {
    --content: min(calc(100% - clamp(120px, 10vw, 280px)), clamp(1080px, 75vw, 1440px));
    --gap: clamp(96px, 6vw, 144px);
    --nav-height: clamp(58px, 3.75vw, 72px);
  }

  .site-header { height: var(--nav-height); }
  .eyebrow, .section-label h2, .meta-label, .work-category, .work-tag, .nav-links a, .wordmark {
    font-size: clamp(11px, .65vw, 13px);
  }
  .nav-links { gap: clamp(26px, 1.8vw, 36px); }

  .hero {
    min-height: calc(100vh - var(--nav-height));
    min-height: calc(100svh - var(--nav-height));
    padding: clamp(96px, 6.5vw, 144px) 0 clamp(152px, 9vw, 220px);
  }
  .hero h1 { font-size: clamp(4.75rem, 5vw, 6.4rem); }
  .hero-lead {
    max-width: 48ch;
    font-size: clamp(1.3rem, 1.4vw, 1.55rem);
  }
  .hero-detail {
    margin-top: clamp(54px, 3.2vw, 72px);
    padding-top: clamp(18px, 1.2vw, 24px);
  }

  .works { padding-bottom: var(--gap); }
  .work-row {
    grid-template-columns: 32px 10px minmax(0, 1.15fr) minmax(0, 1fr) 26px;
    gap: 0 clamp(22px, 1.5vw, 30px);
    min-height: clamp(92px, 5.6vw, 116px);
    padding: clamp(18px, 1.2vw, 24px) clamp(14px, 1vw, 20px);
  }
  .work-chip { width: 10px; height: 10px; }
  .work-name { font-size: clamp(2rem, 2.1vw, 2.6rem); }
  .work-arrow { font-size: clamp(16px, 1vw, 20px); }

  .contact-head { margin-bottom: clamp(26px, 1.8vw, 36px); }
  .contact h2 { font-size: clamp(3rem, 3.2vw, 4rem); }
  .contact-list a {
    grid-template-columns: clamp(120px, 9vw, 180px) minmax(0, 1fr) 26px;
    min-height: clamp(74px, 5vw, 100px);
    padding: clamp(16px, 1.2vw, 24px) clamp(14px, 1vw, 20px);
  }
  .contact-list strong { font-size: clamp(17px, 1.05vw, 21px); }

  .me-page { padding: clamp(90px, 6vw, 120px) 0 var(--gap); }
  .me-page h1 { font-size: clamp(4.5rem, 4.8vw, 6rem); }
  .me-intro {
    max-width: 70ch;
    font-size: clamp(17px, 1vw, 20px);
  }
  .cv-row {
    grid-template-columns: minmax(0, 1fr) clamp(190px, 14vw, 250px);
    gap: 12px clamp(32px, 3vw, 60px);
    padding: clamp(22px, 1.6vw, 32px) 0;
  }
  .cv-row h3 { font-size: clamp(1.15rem, 1.25vw, 1.5rem); }
  .cv-org { font-size: clamp(14px, .85vw, 17px); }
  .cv-note { max-width: 70ch; font-size: clamp(15px, .9vw, 18px); }

  .case-hero { padding: clamp(64px, 4.5vw, 96px) 0 clamp(60px, 4.5vw, 96px); }
  .case-hero h1 { font-size: clamp(4rem, 4vw, 5.75rem); }
  .case-lead {
    max-width: 50ch;
    font-size: clamp(1.2rem, 1.25vw, 1.5rem);
  }
  .case-facts {
    gap: 24px clamp(28px, 2.5vw, 48px);
    margin-top: clamp(48px, 3.5vw, 72px);
    padding-top: clamp(20px, 1.5vw, 30px);
  }
  .case-facts dt { font-size: clamp(10px, .6vw, 12px); }
  .case-facts dd { font-size: clamp(15px, .9vw, 18px); }

  .case-demo-inner {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
    gap: clamp(56px, 5vw, 96px);
  }
  .case-demo-copy p { max-width: 52ch; font-size: clamp(16px, .95vw, 19px); }
  .mobile-demo { width: min(100%, 340px); }

  .case-body { max-width: 74ch; }
  .case-body p, .finding-list li { font-size: clamp(16px, .95vw, 19px); }
  .finding-list { gap: clamp(12px, 1vw, 20px); }
  .finding-list li { padding-top: clamp(12px, 1vw, 20px); }

  .step-list { gap: clamp(44px, 4vw, 80px); }
  .step { gap: clamp(40px, 4vw, 80px); }
  .step-copy h3 { font-size: clamp(1.6rem, 1.7vw, 2rem); }
  .step-copy p { max-width: 48ch; font-size: clamp(15px, .9vw, 18px); }

  .decision-grid { gap: clamp(16px, 1.5vw, 28px); }
  .decision-card { padding: clamp(22px, 1.8vw, 36px); }
  .decision-card h3 { font-size: clamp(1.15rem, 1.3vw, 1.55rem); }
  .decision-card p { font-size: clamp(15px, .9vw, 18px); }
  .stat-row { gap: clamp(16px, 1.5vw, 28px); }
  .stat-row strong { font-size: clamp(2.4rem, 2.8vw, 3.25rem); }
  .case-footer { padding-top: clamp(22px, 1.5vw, 30px); }
}
```

- [ ] **Step 4: Run the focused test and confirm the contract passes**

Run: `npm test -- --run src/styles.test.ts`

Expected: PASS, one test passed.

- [ ] **Step 5: Run the existing test suite to detect regressions**

Run: `npm test -- --run`

Expected: PASS with zero failed tests. If an unrelated pre-existing failure appears, record it separately and do not weaken that test.

- [ ] **Step 6: Commit the tested CSS change**

```bash
git add src/styles.test.ts src/styles.css
git commit -m "feat: scale portfolio for ultrawide screens"
```

### Task 2: Verify layout behavior across viewport sizes

**Files:**
- Modify only if browser findings require a correction: `src/styles.css`
- Test: `src/styles.test.ts`

- [ ] **Step 1: Start the local development server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL and keeps running without startup errors.

- [ ] **Step 2: Check the homepage at three viewport sizes**

Open `/` at 390×844, 1440×900, and 2560×1440. Confirm that there is no horizontal overflow, the mobile layout is unchanged, the 1440px layout matches the prior scale, and the 2560px hero remains one screen tall with its content near the bottom. At 2560px, Selected Works must remain below the fold.

- [ ] **Step 3: Check the Me page and a representative case study**

Open `/me` and `/work/claimly` at 390×844 and 2560×1440. Confirm that long prose retains a readable measure, CV dates remain aligned, the case facts stay in four columns on the large screen, the demo copy and phone frame balance each other, and no content is clipped.

- [ ] **Step 4: Correct any visual regression and rerun the focused test**

If a check fails, adjust only the values inside `@media (min-width: 1440px)`, then run `npm test -- --run src/styles.test.ts`. Update the contract only when the approved design itself requires a different invariant, not merely to make a broken implementation pass.

- [ ] **Step 5: Run all automated verification commands**

Run:

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: every command exits with status 0, all tests pass, and `git diff --check` prints no whitespace errors.

- [ ] **Step 6: Commit any browser-driven refinements**

If Step 4 changed `src/styles.css`, run:

```bash
git add src/styles.css src/styles.test.ts
git commit -m "fix: refine ultrawide portfolio proportions"
```

If Step 4 required no changes, do not create an empty commit.
