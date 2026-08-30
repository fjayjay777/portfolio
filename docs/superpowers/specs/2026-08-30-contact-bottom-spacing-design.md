# Contact Bottom Spacing Design

## Goal

Increase the whitespace between the homepage footer note and the bottom edge of the page so the Let’s Talk section feels balanced.

## Design

Change the Contact section’s bottom padding from the fixed `28px` value to the existing responsive `--gap` token. This makes the top and bottom section padding symmetrical and scales the bottom whitespace from approximately 56px on small screens to 96px on large screens.

Keep the footer note’s existing 24px top margin. Do not change the Contact content, background, row spacing, typography, or responsive layout.

## Verification

Confirm the Contact rule uses `padding: var(--gap) 0`, run the existing targeted page tests, type checking, linting, and the production build, and check the final CSS diff for unrelated edits.
