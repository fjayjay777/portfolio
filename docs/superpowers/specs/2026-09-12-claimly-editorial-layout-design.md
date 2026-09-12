# Claimly Editorial Layout Redesign

## Goal

Redesign Claimly's text-led case-study sections so the desktop page no longer feels anchored to the left with unused space on the right. The new layout should feel composed across the full content width while keeping the writing easy to read. The cover, Interactive demo, and Product walkthrough stay unchanged.

## Direction

Use a restrained editorial grid. Each text-led section shares the same underlying columns, but the content can take a different position within them. Body copy keeps a comfortable line length. Short statements, research figures, and numbered decisions use the space beside it to create balance and make the argument easier to scan.

The treatment stays within the site's existing visual language: warm off-white surfaces, blue-gray accents, serif display type, sans-serif body copy, monospaced labels, thin rules, and generous whitespace. It adds no illustrations, gradients, decorative shapes, or dense collections of cards.

## Section Composition

### Overview

The overview becomes a two-part introduction. The main explanation occupies the central reading column, while a short pull statement sits beside it at a larger size. The pull statement should capture Claimly's central product argument rather than repeat a sentence verbatim.

### Research

The research setup remains short. The three findings become numbered editorial rows instead of a single narrow list. Each row separates the finding from its explanation, letting the content span the page without stretching paragraph line length. The existing research counts remain factual and visible; no new research results will be invented.

### Design Decisions

The three decisions move from equal bordered cards to a quieter numbered sequence. Titles, explanations, and index numbers align across columns. This gives each decision more room and makes the relationship between evidence and interface choices easier to follow.

### Outcome

The three existing figures form a full-width data band. Below it, the copy is divided into two ideas: what was completed during the Innovation Jam, and what still needs to be tested in a real product. The split should improve scanning without implying outcomes the prototype has not produced.

### Reflection

A large reflective statement holds one side of the section while a narrower text column explains it. The statement should sound like the existing author: direct, specific, and willing to acknowledge the prototype's limit.

## Writing

Existing claims and facts remain authoritative. Long sentences may be tightened, paragraphs may be reordered, and key ideas may be rewritten to improve rhythm. Small additions are allowed when they connect research to a design decision or make the product logic clearer. The revision must not invent validation, user quotes, launch results, team contributions, or business impact.

## Responsive Behavior

On wide screens, text-led sections use the full case-study container through an asymmetric grid. At tablet widths, the columns narrow without allowing body text to become too wide. On phones, every composition collapses into a single reading order: section label, key statement or title, then supporting copy. No horizontal scrolling or compressed side-by-side prose is allowed.

## Implementation Boundary

The first pass applies only to `ClaimlyPage`. Shared styles may be introduced where they provide a clean basis for later case studies, but Medisync and Sizzle should not change in this task. Existing project components should be reused unless a small, focused case-study component makes the markup clearer.

## Verification

Automated checks should confirm that the Claimly route and its demo contract still work. Visual checks should cover desktop, tablet, and phone viewports, with attention to reading width, right-side balance, section rhythm, responsive ordering, and overflow. The Interactive demo, Product walkthrough, and hero must be compared against the current layout to ensure they were not unintentionally changed.
