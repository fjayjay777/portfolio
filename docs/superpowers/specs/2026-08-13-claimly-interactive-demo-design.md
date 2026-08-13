# Claimly Interactive Demo Design

## Goal

Add a first interactive mobile-demo showcase for Claimly to the existing UX portfolio. The demo must run the existing Claimly React application rather than a portfolio-specific recreation, so its interactions remain faithful to the source project.

## Scope

This first increment covers Claimly only. Medisync and Sizzle will follow the same convention once the embed pattern is proven.

## Architecture

The portfolio and Claimly remain separate applications. The Claimly production build is placed at `public/demos/claimly/` in the portfolio repository and exposed at `/demos/claimly/` by the deployed site.

The portfolio adds a `demo` field to Claimly's project metadata. `ProjectDialog` renders a new `MobileDemoFrame` component when that metadata is present. The component owns the isolated `<iframe>`, a loading state, an error fallback, and an external/open-full-size link.

The iframe boundary prevents Claimly styles, dependencies, routing, and React state from affecting the portfolio. Claimly must use `/demos/claimly/` as its production base path so assets and any client-side route fallbacks work at the nested URL.

## User experience

Selecting Claimly from Selected works opens the existing project dialog, now expanded into a compact case-study view:

- Introductory project information remains above the demo.
- The interactive prototype appears in a vertically oriented phone frame.
- A loading label is shown until the iframe has loaded.
- A clearly labelled link opens the demo directly, allowing more screen space.
- If loading fails, the frame shows an accessible fallback with the direct link.
- Escape, close-button action, backdrop dismissal, and return-focus behavior remain unchanged.

The embedded frame is responsive: it stays within the dialog on large screens and becomes full-width on narrow screens, without trapping horizontal page scroll.

## Build and delivery

Add a repeatable portfolio script that builds Claimly and copies its output to `public/demos/claimly/` before the Vite portfolio build. The script intentionally copies only generated assets; Claimly source remains in its existing repository. A later generalization can build all three demos through a manifest.

## Validation

Portfolio tests will verify that Claimly opens a demo iframe with the expected URL and title, that the direct link has the expected destination, and that existing close/focus behavior still works. The Claimly app is validated by its own existing build/test commands where available.

## Non-goals

This increment does not alter Claimly product behavior, merge the three applications into a monorepo, add analytics, or add Medisync/Sizzle embeds.
