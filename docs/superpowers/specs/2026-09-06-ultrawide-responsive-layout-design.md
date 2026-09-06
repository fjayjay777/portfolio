# Ultrawide Responsive Layout Design

## Goal

The portfolio should retain its restrained, spacious character on large monitors without looking like a small desktop layout floating in an empty canvas. The update applies to the homepage, Me page, contact section, and all three case studies. Existing mobile and standard desktop behavior must remain unchanged.

## Responsive strategy

The current 1080px content cap works well through ordinary desktop sizes. A new ultrawide layer will begin at 1440px and let the shared content shell grow smoothly to a final cap of 1440px. Side gutters will remain generous and will grow with the viewport, so the layout never feels edge-to-edge.

The ultrawide layer will use the existing CSS architecture. Shared custom properties will control content width, navigation height, and section spacing. Component-specific rules will adjust typography, row height, grid gaps, and card padding. No page markup or content will change.

## Homepage and navigation

The navigation and hero will use the same wider shell as the rest of the site. The hero will continue to occupy the first viewport and keep its content anchored near the bottom. Its title, lead copy, metadata, and spacing will scale gently above 1440px, giving the composition more visual weight without revealing Selected Works in the first screen.

Works rows and the contact section will grow in proportion to the shell. Names, labels, row heights, and padding will increase within capped ranges. The visual hierarchy, hover behavior, and number of columns will stay the same.

## Me page and case studies

The Me page will use the wider outer shell, while its introductory prose will keep a controlled reading measure. CV rows can use the extra horizontal space for clearer separation between descriptions and dates.

Case-study headers, leads, fact grids, demos, walkthroughs, decision cards, statistics, and footers will share the new ultrawide scale. Long-form text will not stretch to the full shell. Its measure will remain readable while font size and line height increase slightly. The interactive phone frame will grow from its current 300px cap to a 340px cap on ultrawide screens, keeping it visibly phone-sized. Media placeholders and multi-column sections will receive most of the additional width.

## Breakpoints and safeguards

Rules below 1440px will not be rewritten. The new layer will use fluid values with minimum and maximum bounds, preventing runaway scaling on 4K and wider displays. Existing 900px and 680px breakpoints remain authoritative for tablet and mobile layouts.

The update will not add content, new navigation, new animation, or a second layout system. It only changes scale and spacing at large viewport widths.

## Verification

A regression test will establish the ultrawide CSS contract before the stylesheet is changed. Verification will cover the existing Vitest suite, TypeScript, ESLint, and a production build. Browser checks will compare the homepage, Me page, and a representative case study at mobile, standard desktop, and roughly 2560px widths. The final check will confirm that the hero still fills the first screen, prose remains readable, grids use the wider canvas, and no horizontal overflow appears.
