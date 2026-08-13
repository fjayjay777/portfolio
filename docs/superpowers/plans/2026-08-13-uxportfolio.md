# UXPortfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, deployable two-page React portfolio from the UXPortfolio Figma design, with reliable Works and Contact navigation.

**Architecture:** A Vite React app uses React Router for `/` and `/me`. The shared `SiteNav` either scrolls within the Homepage or sends the user to a Homepage hash; a small hook performs post-navigation hash scrolling. Home sections and the Me profile remain page-level components, while the project dialog owns its own dismissal behavior.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Vitest, Testing Library, plain CSS.

---

## File structure

| File | Responsibility |
| --- | --- |
| `package.json`, Vite/TypeScript/Vitest config | Project scripts and test environment |
| `src/main.tsx` | Browser entry point and Router bootstrap |
| `src/App.tsx` | Route table and fallback route |
| `src/components/SiteNav.tsx` | Cross-route navigation and accessible mobile menu |
| `src/components/ProjectDialog.tsx` | Accessible selected-project dialog |
| `src/hooks/useHashScroll.ts` | Homepage hash target scrolling |
| `src/pages/HomePage.tsx` | Hero, works, skills, and contact sections |
| `src/pages/MePage.tsx` | Profile/biography page |
| `src/styles.css` | Design tokens and responsive layout |
| `src/test/setup.ts` | Testing Library matchers and browser API shims |
| `src/App.test.tsx` | Route, navigation, anchor, and dialog integration tests |

### Task 1: Create the Vite React test baseline

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Define the expected test command before adding application code**

Create `package.json` with these scripts and development dependencies:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint . --max-warnings=0"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "vite": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies and verify the test runner starts**

Run: `npm install && npm test -- --run`

Expected: Vitest starts successfully and reports no test files yet.

- [ ] **Step 3: Add Vite, TypeScript, and test setup**

Configure Vite with `react()` and `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`. Configure TypeScript with `jsx: 'react-jsx'`, strict checking, and include `src`. In `src/test/setup.ts`, import `@testing-library/jest-dom/vitest` and set `window.matchMedia` to a no-op listener implementation. Create `src/main.tsx` that imports `styles.css`, wraps `<App />` in `<BrowserRouter>`, and mounts to `#root`.

- [ ] **Step 4: Verify baseline tooling**

Run: `npm run typecheck && npm run build`

Expected: both commands exit with status 0 after the minimal `App` placeholder exists in Task 2.

- [ ] **Step 5: Commit the baseline**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src/main.tsx src/test/setup.ts
git commit -m "chore: scaffold ux portfolio app"
```

### Task 2: Build routes and cross-page anchor navigation

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/SiteNav.tsx`
- Create: `src/hooks/useHashScroll.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing navigation tests**

Add tests that render the app at `/` and `/me`. Mock `Element.prototype.scrollIntoView`, click `Works` from `/`, and expect `#works` to receive `{ behavior: 'smooth', block: 'start' }`. Click `Contact` from `/me`, await Homepage rendering, and expect the pathname to be `/` with `#contact` scrolled into view. Assert that `ME` navigates to `/me`.

```tsx
it('scrolls Works on the homepage', async () => {
  renderAt('/');
  await userEvent.setup().click(screen.getByRole('link', { name: 'Works' }));
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
});

it('sends Contact from Me to the homepage contact section', async () => {
  renderAt('/me');
  await userEvent.setup().click(screen.getByRole('link', { name: 'Contact' }));
  expect(await screen.findByRole('heading', { name: "Let’s Talk" })).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because `App`, `SiteNav`, and the anchor sections do not exist.

- [ ] **Step 3: Implement the smallest route and scroll surface**

Create `App` with `/` → `HomePage`, `/me` → `MePage`, and a wildcard `<Navigate to="/" replace />`. `SiteNav` renders semantic links: `to="/#works"`, `to="/#skills"`, `to="/me"`, and `to="/#contact"`. `useHashScroll` reads `location.hash` in an effect, finds the element by its ID, calls `scrollIntoView({ behavior: 'smooth', block: 'start' })`, and clears no history state. `HomePage` temporarily renders `id="works"`, `id="skills"`, and `id="contact"`; `MePage` temporarily renders its heading.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm test -- --run src/App.test.tsx`

Expected: all route and anchor tests pass.

- [ ] **Step 5: Commit the navigation behavior**

```bash
git add src/App.tsx src/components/SiteNav.tsx src/hooks/useHashScroll.ts src/App.test.tsx
git commit -m "feat: add portfolio routes and anchor navigation"
```

### Task 3: Implement Homepage content and work-card interaction

**Files:**
- Create: `src/components/ProjectDialog.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing project interaction tests**

Test that Claimly, Medisync, and Sizzle are buttons; clicking Claimly opens a dialog named `Claimly project details`; Escape closes it; and the dialog close button returns focus to the triggering card.

```tsx
it('opens and dismisses project details', async () => {
  const user = userEvent.setup();
  renderAt('/');
  const trigger = screen.getByRole('button', { name: /Claimly project/i });
  await user.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Claimly project details' })).toBeVisible();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/App.test.tsx -t "opens and dismisses project details"`

Expected: FAIL because no work card/dialog exists.

- [ ] **Step 3: Implement the content and dialog**

Render the Figma hero text, project list, biography, contact rows, and footer. Model projects as a local constant with names `Claimly`, `Medisync`, and `Sizzle`; each card is a `<button>` that sets selected project state. Implement `ProjectDialog` as a native `<dialog>`-style semantic overlay with `role="dialog"`, `aria-modal="true"`, an explicit Close button, focus capture/restoration, and a keydown Escape handler. Render contact data as `mailto:huangjn35@gmail.com`, `tel:+13855384176`, and a clearly labelled LinkedIn link.

- [ ] **Step 4: Run the Homepage interaction and full test suite**

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 5: Commit Homepage behavior**

```bash
git add src/pages/HomePage.tsx src/components/ProjectDialog.tsx src/App.test.tsx
git commit -m "feat: implement interactive portfolio homepage"
```

### Task 4: Implement the Me page and responsive Figma styling

**Files:**
- Create: `src/pages/MePage.tsx`
- Create: `src/styles.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing Me-page content test**

```tsx
it('renders the Me page biography and its shared navigation', () => {
  renderAt('/me');
  expect(screen.getByRole('heading', { name: /Jiani Huang/i })).toBeVisible();
  expect(screen.getByText(/designer and developer with eight years/i)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/App.test.tsx -t "renders the Me page biography"`

Expected: FAIL because the finished Me profile content is absent.

- [ ] **Step 3: Implement the profile and CSS design system**

Use `SiteNav` in `MePage`; render a portrait frame and the Figma biography. In `styles.css`, define tokens for background, text, muted text, rule color, dark contact background, spacing, and content width. Apply the 795px desktop shell, CSS grid for the works section, and a two-column profile. Add a `max-width: 680px` media query that stacks content, creates a horizontal-wrap navigation, switches work cards to one column, and enlarges touch targets. Include `:focus-visible` and `prefers-reduced-motion` rules.

- [ ] **Step 4: Run all tests and check responsive code compiles**

Run: `npm test -- --run && npm run typecheck`

Expected: every test passes and TypeScript exits with status 0.

- [ ] **Step 5: Commit Me page and styling**

```bash
git add src/pages/MePage.tsx src/styles.css src/App.test.tsx
git commit -m "feat: add responsive me page styling"
```

### Task 5: Production verification and handoff

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document local run and deployment prerequisites**

Create a concise README with `npm install`, `npm run dev`, the verification commands, and an explicit note that the site can be launched to Vercel or Netlify only after the user chooses a hosting account/project.

- [ ] **Step 2: Run the complete verification suite**

Run: `npm test -- --run && npm run typecheck && npm run lint && npm run build`

Expected: every command exits with status 0 and Vite outputs `dist/`.

- [ ] **Step 3: Review implementation scope**

Check the implementation against the design spec: two routes, Works scrolling, Contact jump to Homepage bottom from both pages, project cards, responsive layouts, keyboard-accessible dialog, and local-only client behavior.

- [ ] **Step 4: Commit the documentation**

```bash
git add README.md
git commit -m "docs: add ux portfolio run guide"
```
