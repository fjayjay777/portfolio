# Nighty Smart Pillow Case Study

## Goal

Add a fourth case study, Nighty, a physical smart pillow that adjusts its temperature to the room, plays white noise, and records how deeply the sleeper sleeps. The page centers on a high-fidelity, interactive 3D model of the pillow and an exploded view of its internal components. Narrative sections (research, process, outcome) are out of scope for this pass; the author will write them later.

## Facts

These come from the author and are the only project facts the page states.

- Name: Nighty
- Timeline: June 2024
- Role: Product design
- Team: 4 people
- Form: a standard contoured (ergonomic) memory-foam pillow

The internal components below were designed for this page. They are not documented as the team's actual build, and the author must confirm them before publishing.

## Approach

Vanilla `three.js` with procedurally generated geometry. Every part is built in code at real-world millimetre dimensions, so the model stays precise and editable without external model files. `three` is the only new dependency. The page is lazy-loaded with `React.lazy`, so the homepage bundle does not grow.

Rejected: React Three Fiber (two or three extra dependencies for a single scene) and pre-rendered Blender stills or video (not interactive, and every part change needs a re-render).

## Pillow Form

- Footprint 600 × 360 mm, rounded rectangle with softened corners.
- Profile across the depth: front neck roll 110 mm high, rear roll 90 mm, central head cradle 70 mm.
- Profile across the width: the two shoulder ends rise slightly above the centre for side sleepers.
- The top surface is a height field sampled on a grid of about 256 × 160 segments with smooth normals, and all bottom and side edges are rounded.
- Materials: knit fabric with a procedural rib texture and sheen for the cover, matte cellular foam, translucent gel, dark film with printed traces, a green PCB, and satin plastic and metal for the pod.
- Lighting: `RoomEnvironment` image-based light plus one soft shadow-casting key light. No external HDR or texture files.

## Components (top to bottom)

| # | Part | Function |
|---|------|----------|
| 01 | 3D knit cover, removable, with zip | Contact surface |
| 02 | Perforated memory-foam comfort layer | Comfort, airflow |
| 03 | Phase-change cooling gel layer | Passive cooling |
| 04 | Carbon-fibre heating film with four NTC probes | Active warming |
| 05 | Piezoelectric sleep-sensing strip (breathing, heart rate, movement) | Sleep-depth tracking |
| 06 | Flat speakers, one in each shoulder end | White noise |
| 07 | High-density memory-foam core with electronics cavity and air channels | Support |
| 08 | Main board: MCU, Bluetooth / Wi-Fi, heater and fan drivers | Control |
| 09 | Rear pod: room temperature and humidity sensor behind a vent grille, quiet fan, button, status LED, USB-C | Room sensing, forced airflow |
| 10 | Anti-slip base cloth | Grip |

Temperature logic stated on the page: when the room is warm, the gel layer and the fan move heat away; when it is cold, the heating film warms the head area.

## Interaction

- Drag to orbit and scroll to zoom, both within clamped ranges.
- An explode slider (0 to 100%) and an Assemble / Explode toggle. Each part moves along its own offset, and parts separate in sequence rather than all at once.
- Numbered labels track their parts in 3D.
- Hovering or selecting a part, in the scene or in the parts list, highlights it, fades the others, and shows its description.
- `prefers-reduced-motion` turns the explode tween into an immediate change and disables auto-rotation.
- Without WebGL the viewer shows a short notice, and the parts list still renders in full.
- The canvas renders only while the viewer is on screen, and the renderer and geometry are disposed on unmount.

## Page Structure

1. Hero: back link, eyebrow "Sleep technology", title, lead, and facts (Role, Timeline, Team, Scope).
2. Model: a full-width raised band with the assembled pillow.
3. Exploded view: the viewer with slider and labels beside the numbered parts list.
4. `CaseFooter`.

Copy is in English and matches the existing case pages in tone. The homepage gains Nighty as work 04, with an SVG cover in the style of the other covers, and `caseOrder` gains Nighty so the "Next project" loop includes it.

## Code Structure

- `src/nighty/parts.ts` holds the component data: id, name, function, description, material key, and explode offset.
- `src/nighty/geometry.ts` holds pure builders: the pillow height field, the layer shapes, and the pod. Dimensions are in millimetres.
- `src/nighty/explode.ts` holds pure interpolation of per-part offsets for a given explode amount.
- `src/nighty/NightyViewer.tsx` owns the three.js scene lifecycle, controls, picking, labels, and cleanup.
- `src/pages/NightyPage.tsx` is the lazy-loaded route at `/work/nighty`.

## Verification

- Unit tests cover the part data (ten parts, unique ids, ordered), explode interpolation (0 means assembled, 1 means fully offset, monotonic in between), and geometry sanity (no NaN positions, bounding box within the stated dimensions).
- A route test covers `/work/nighty` in jsdom, where there is no WebGL: the hero, facts, and full parts list render, and the fallback notice appears.
- The homepage test is updated for four works.
- `npm test -- --run`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- A visual check in a real browser at desktop and phone widths covers the model's shape, the explode sequence, label tracking, selection, and overflow.
