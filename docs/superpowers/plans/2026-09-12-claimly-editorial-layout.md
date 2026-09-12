# Claimly Editorial Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose Claimly's text-led case-study sections into a restrained editorial grid that uses the full desktop width and collapses into a clear single-column mobile reading order.

**Architecture:** Keep the existing route and shared case-study components. Add Claimly-specific semantic wrappers and content to `ClaimlyPage.tsx`, then add a scoped `.claimly-page` layout layer in `styles.css` so Medisync, Sizzle, the hero, demo, and walkthrough keep their current behavior.

**Tech Stack:** React, TypeScript, CSS Grid, Vitest, Testing Library, Vite

---

### Task 1: Protect the editorial content structure

**Files:**
- Modify: `src/App.test.tsx:53-59`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing structure test**

Add a test that identifies the new Claimly editorial regions by accessible text rather than styling details:

```tsx
test('renders Claimly editorial summaries and numbered findings', () => {
  renderAt('/work/claimly')

  expect(screen.getByText('The document creates the doubt. Claimly gives the user enough evidence to act on it.')).toBeVisible()
  expect(screen.getByLabelText('Research findings')).toBeVisible()
  expect(screen.getByText('01', { selector: '.finding-index' })).toBeVisible()
  expect(screen.getByText('The last mile is still a phone call.')).toBeVisible()
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because the new summary copy and `Research findings` label are absent.

- [ ] **Step 3: Commit the test**

```bash
git add src/App.test.tsx
git commit -m "test: define claimly editorial structure"
```

### Task 2: Recompose Claimly's text-led sections

**Files:**
- Modify: `src/pages/ClaimlyPage.tsx:38-211`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Give the page a Claimly scope and model the research findings**

Add `claimly-page` to the `<main>` class and move the findings into structured data:

```tsx
const findings = [
  {
    title: 'People pay bills they cannot read.',
    note: 'The most common response was to pay anyway. The bill did not look correct; disputing it simply felt like the greater risk.',
  },
  {
    title: 'Knowing an appeal exists is not enough.',
    note: 'Two interviewees knew they could appeal and still stopped. The legitimate path asked for more time and confidence than they had.',
  },
  {
    title: 'The document people are told to check is the one they cannot read.',
    note: 'Six respondents had never compared an EOB with the bill, and nine were unclear on what an EOB was. The step that could reveal the error was the least accessible one.',
  },
]

<main className="case-page claimly-page">
```

- [ ] **Step 2: Build the overview and research compositions**

Use an editorial wrapper for the overview and numbered rows for research:

```tsx
<div className="claimly-editorial claimly-overview">
  <p className="claimly-pullquote">The document creates the doubt. Claimly gives the user enough evidence to act on it.</p>
  <div className="case-body claimly-reading">...</div>
</div>

<div className="claimly-research-intro">
  <p className="claimly-research-count">15+ survey responses<br />4+ follow-up interviews</p>
  <p>Before drawing a screen, I checked what people actually did with a medical bill they could not understand.</p>
</div>
<ol className="claimly-findings" aria-label="Research findings">
  {findings.map((finding, index) => (
    <li key={finding.title}>
      <span className="finding-index">0{index + 1}</span>
      <h3>{finding.title}</h3>
      <p>{finding.note}</p>
    </li>
  ))}
</ol>
```

- [ ] **Step 3: Build the decision, outcome, and reflection compositions**

Keep the existing facts but place them in clearer editorial units:

```tsx
<ol className="claimly-decisions">
  {decisions.map((decision, index) => (
    <li key={decision.title}>
      <span className="decision-index">0{index + 1}</span>
      <h3>{decision.title}</h3>
      <p>{decision.note}</p>
    </li>
  ))}
</ol>

<div className="stat-row claimly-stat-row">...</div>
<div className="claimly-outcome-copy">
  <div><p className="claimly-kicker">Built in six weeks</p><p>...</p></div>
  <div><p className="claimly-kicker">Still to prove</p><p>...</p></div>
</div>

<div className="claimly-reflection">
  <p className="claimly-reflection-lead">The last mile is still a phone call.</p>
  <div className="case-body claimly-reading">...</div>
</div>
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm test -- --run src/App.test.tsx`

Expected: all tests in `src/App.test.tsx` pass.

- [ ] **Step 5: Commit the page structure**

```bash
git add src/pages/ClaimlyPage.tsx src/App.test.tsx
git commit -m "feat: restructure claimly case narrative"
```

### Task 3: Add the restrained editorial layout

**Files:**
- Modify: `src/styles.css:302-333`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Add desktop editorial grid styles scoped to Claimly**

Add the following layout layer after the shared case-study styles:

```css
.claimly-editorial,
.claimly-reflection {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(24px, 3vw, 48px);
  align-items: start;
}
.claimly-pullquote,
.claimly-reflection-lead {
  grid-column: 1 / span 5;
  margin: 0;
  color: var(--ink);
  font: 400 clamp(1.8rem, 3vw, 2.7rem)/1.12 var(--serif);
  letter-spacing: -.035em;
}
.claimly-reading { grid-column: 7 / -1; max-width: 62ch; }
.claimly-research-intro {
  display: grid;
  grid-template-columns: minmax(190px, 3fr) minmax(0, 7fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
}
.claimly-research-count,
.claimly-kicker {
  margin: 0;
  color: var(--accent);
  font: 400 12px/1.65 var(--mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.claimly-research-intro > p:last-child { max-width: 58ch; margin: 0; font-size: 16px; line-height: 1.7; }
.claimly-findings,
.claimly-decisions { margin: clamp(32px, 4vw, 52px) 0 0; padding: 0; list-style: none; }
.claimly-findings li,
.claimly-decisions li {
  display: grid;
  grid-template-columns: 56px minmax(180px, 4fr) minmax(0, 6fr);
  gap: clamp(20px, 3vw, 48px);
  border-top: 1px solid var(--rule);
  padding: clamp(22px, 2.5vw, 34px) 0;
}
.finding-index,
.decision-index { color: var(--accent); font: 400 11px/1.5 var(--mono); letter-spacing: .14em; }
.claimly-findings h3,
.claimly-decisions h3 { margin: 0; font: 400 clamp(1.2rem, 1.8vw, 1.55rem)/1.25 var(--serif); }
.claimly-findings p,
.claimly-decisions p { max-width: 58ch; margin: 0; color: #35312b; font-size: 15px; line-height: 1.68; }
.claimly-stat-row { max-width: none; margin-bottom: clamp(32px, 4vw, 52px); }
.claimly-outcome-copy { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(40px, 6vw, 88px); }
.claimly-outcome-copy > div { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 20px; }
.claimly-outcome-copy p:last-child { margin: 0; color: #35312b; font-size: 16px; line-height: 1.7; }
```

- [ ] **Step 2: Add tablet and phone fallbacks**

Inside `@media (max-width: 900px)`, stack the editorial pair and simplify the row grids:

```css
.claimly-editorial,
.claimly-reflection { grid-template-columns: 1fr; gap: 24px; }
.claimly-pullquote,
.claimly-reflection-lead,
.claimly-reading { grid-column: auto; }
.claimly-findings li,
.claimly-decisions li { grid-template-columns: 42px minmax(170px, .8fr) minmax(0, 1.2fr); gap: 20px; }
.claimly-outcome-copy { grid-template-columns: 1fr; gap: 28px; }
```

Inside `@media (max-width: 680px)`, stack each row and keep its index beside the title:

```css
.claimly-research-intro { grid-template-columns: 1fr; gap: 18px; }
.claimly-findings li,
.claimly-decisions li { grid-template-columns: 32px minmax(0, 1fr); gap: 8px 12px; }
.claimly-findings p,
.claimly-decisions p { grid-column: 2; }
.claimly-outcome-copy > div { grid-template-columns: 1fr; gap: 10px; }
```

- [ ] **Step 3: Run static checks**

Run: `npm run typecheck && npm run lint && npm test -- --run`

Expected: all commands exit 0.

- [ ] **Step 4: Commit the layout**

```bash
git add src/styles.css
git commit -m "style: balance claimly editorial sections"
```

### Task 4: Verify the finished case study

**Files:**
- Verify: `src/pages/ClaimlyPage.tsx`
- Verify: `src/styles.css`

- [ ] **Step 1: Build the complete site**

Run: `npm run build`

Expected: Vite completes successfully and writes `dist/index.html` plus all three prepared demos.

- [ ] **Step 2: Start the local preview**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a reachable localhost URL.

- [ ] **Step 3: Check desktop, tablet, and phone layouts**

Open `/work/claimly` at 1440×1000, 900×1000, and 390×844. Confirm that the text-led sections use the right half of the desktop canvas, paragraph lines remain readable, indices align, mobile content follows the intended reading order, and there is no horizontal overflow.

- [ ] **Step 4: Check protected sections**

Compare the hero, Interactive demo, and Product walkthrough with the current page. Confirm that their structure, frame sizing, and interactions are unchanged.

- [ ] **Step 5: Review the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the planned Claimly files plus the user's pre-existing unrelated changes appear.
