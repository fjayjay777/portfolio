# Contact Bottom Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase the homepage Contact section’s bottom whitespace using the site’s existing responsive spacing token.

**Architecture:** Make one scoped change to the `.contact` rule in the shared stylesheet. Reuse `--gap` for both vertical padding values so the spacing remains responsive and consistent with the rest of the site, while preserving all Contact markup and inner spacing.

**Tech Stack:** CSS custom properties, React, TypeScript, Vite, Vitest

---

### Task 1: Increase Contact bottom padding

**Files:**
- Modify: `src/styles.css:129`

- [ ] **Step 1: Verify the desired CSS rule is not present yet**

Run:

```bash
rg -n '^\.contact \{ background: var\(--raised\); padding: var\(--gap\) 0; \}$' src/styles.css
```

Expected: exit status 1 with no match because the current rule ends with a fixed `28px` bottom padding.

- [ ] **Step 2: Apply the minimal CSS change**

Replace the existing Contact rule with:

```css
.contact { background: var(--raised); padding: var(--gap) 0; }
```

Do not change `.footer-note`, `.contact-inner`, Contact typography, or responsive rules.

- [ ] **Step 3: Verify the desired CSS rule is present**

Run:

```bash
rg -n '^\.contact \{ background: var\(--raised\); padding: var\(--gap\) 0; \}$' src/styles.css
```

Expected: exit status 0 with one match in the Contact section.

- [ ] **Step 4: Run focused page tests**

Run:

```bash
npm test -- --run src/pages/HomePage.test.tsx src/pages/MePage.test.tsx
```

Expected: both test files pass, confirming the recent homepage and Me-page behavior remains intact.

- [ ] **Step 5: Run static and production verification**

Run:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: all four commands exit with status 0.

- [ ] **Step 6: Review the scoped CSS diff**

Run:

```bash
git diff -- src/styles.css
git status --short
```

Confirm the new change is limited to the Contact padding declaration on top of the user’s existing stylesheet work. Do not stage or commit implementation files because the working tree contains user-owned, uncommitted changes.
