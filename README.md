# Jiani Huang Portfolio

A responsive Vite + React portfolio based on the `UXPortfolio` Figma design.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

## Launch later

The exported demos in `public/demos/` are committed so cloud builds work without
the sibling app repositories. After changing a demo, run `npm run prepare:demos`
locally and commit the updated exports before deploying.

The production build is generated in `dist/`. `vercel.json` supplies SPA history fallback for Vercel. To deploy, import this `UXwebsite` repository into Vercel, keep the default Vite settings (`npm run build`, output `dist`), and publish. Netlify can use the same build command with a `dist` publish directory.
