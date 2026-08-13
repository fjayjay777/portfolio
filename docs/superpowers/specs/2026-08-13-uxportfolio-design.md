# UXPortfolio Website Design

## Goal

Build a deployable, responsive portfolio website that faithfully translates the `UXPortfolio` Figma file into an interactive web experience. The site contains a Homepage and a separate Me page for Jiani Huang.

## Source design

The source is Figma file `UXPortfolio` (`cW5Jp8IPy2cw011wYNuti4`), Page 1. Homepage is frame `69:2`; Me page is frame `67:417`.

The visual direction is restrained and editorial: a light background, generous whitespace, a compact text navigation bar, a large name-led hero, a three-card project grid, a concise biography, and a high-contrast contact block.

## Information architecture and navigation

The site uses two client-side routes:

| Route | Content |
| --- | --- |
| `/` | Homepage: hero, works, about/skills, and contact |
| `/me` | Me page: biography and portrait |

The shared navigation has Works, Skills, ME, and Contact links.

- Works: smooth-scrolls to `#works` on the homepage. From `/me`, it first navigates to `/#works`.
- Skills: smooth-scrolls to `#skills` on the homepage. From `/me`, it first navigates to `/#skills`.
- ME: navigates to `/me`.
- Contact: navigates or smooth-scrolls to `#contact` at the bottom of the homepage. This satisfies the requested behavior from either page.
- The brand mark returns to `/`.

Anchor targets receive scroll-margin so fixed or sticky navigation never covers their headings. The route change then anchor scroll should be smooth and reliable after the homepage has rendered.

## Homepage

The Homepage starts with the hero copy from the Figma file: “Designer & Researcher”, “Jiani Huang”, an Ann Arbor location note, and a short product-design/development statement.

The Works section presents three visible project cards in the Figma order: Claimly, Medisync, and Sizzle. Each card is keyboard-accessible and opens an internal detail overlay with the project name, a short description, and a close control. This makes the works area genuinely interactive without inventing external case-study URLs.

The Skills/About section uses the Figma biography copy and adds a small, semantic skills list for the requested navigation destination. The section remains compact and visually secondary to the work.

The Contact section is the final visual block. It contains the provided email, phone number, and LinkedIn label as actionable links, followed by the “Design and built by Jiani @2026” footer line.

## Me page

The Me page preserves its source structure: shared navigation, portrait, and a longer biography. It uses the Figma image asset when available; if the source asset cannot be exported it uses a neutral image treatment rather than a misleading substitute. Navigation behavior matches the Homepage exactly.

## Responsive and accessibility behavior

The desktop content width follows the 795-pixel Figma frame. On narrow screens, the navigation collapses cleanly without horizontal overflow; the works grid becomes one column; the Me-page bio stacks below the portrait; and contact rows remain readable.

All navigation, cards, links, and modal controls use semantic elements, visible focus rings, labels, Escape-to-close modal behavior, and appropriate aria state. Motion respects `prefers-reduced-motion`.

## Technical approach

Create a standalone Vite + React + TypeScript project with React Router and plain CSS. Components remain intentionally small:

- `SiteNav` owns cross-route and section navigation.
- `HomePage` composes hero, works, skills, and contact sections.
- `MePage` composes the profile view.
- `ProjectDialog` owns project-card interaction and keyboard dismissal.
- `useHashScroll` waits for homepage rendering before scrolling to a supplied hash.

Use local assets only. Styling uses CSS variables for the small visual system so the responsive layouts remain consistent.

## Verification

Testing covers navigation from both routes, section anchor behavior, project-dialog opening and closing, and rendering of both pages. The project must pass unit tests, TypeScript checking, linting, and a production build before handoff.

## Out of scope

No CMS, backend, analytics, authentication, contact-form submission, tracking, or external deployment action is included in this implementation phase. Launching will be performed after the site is verified and the user approves a hosting destination.
