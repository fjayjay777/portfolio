# Home About Content Migration Design

## Goal

Move the entire About/Skills content from the homepage into the Me page, remove the duplicate homepage section and its navigation link, and give the homepage contact section the same background color as the former About section.

## Me Page Content

Keep the introduction as two paragraphs. The first paragraph retains Jiani's transition from painting to UX and her education. Rewrite the second paragraph to incorporate the homepage About themes without repeating the first paragraph:

> Most of my work focuses on **making complex information easier to understand and technology easier to use**. I’m especially interested in products where the consequences are real: a medical bill written in reason codes, a clinic booking that starts from a blank form, or public health material that has to reach people who didn’t choose to study it. I combine **product design, UX research, and front-end development** to explore how new technology can be genuinely useful, and I like putting a working prototype in someone’s hands instead of only describing one.

Render the two emphasized phrases with semantic `<strong>` elements. They should use the primary text color and a heavier weight so the visual emphasis is clearly visible.

Place the existing four skill tags directly below the introduction:

- Product design
- UX research
- Prototyping
- Front-end development

## Homepage Changes

Remove the homepage `bio` data and the full About section. Remove the Skills link from the shared navigation because its homepage anchor will no longer exist. Keep Works, ME, and Contact unchanged.

Set the homepage contact section background to the existing `--raised` token, which is the same color used by the former About section. Do not introduce a new color value.

## Scope

Do not change Experience, Education, contact details, project cards, case-study pages, or unrelated responsive layout behavior.

## Verification

Add tests that confirm the Me page contains the rewritten introduction and four skill tags, the homepage no longer contains the About section, and the navigation no longer includes Skills. Run targeted tests, type checking, linting, and a production build. Existing unrelated test failures should be reported separately rather than changed as part of this work.
