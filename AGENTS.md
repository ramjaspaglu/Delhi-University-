# Coding Conventions & UI Guidelines

Be advised to always align implementations with the following specific rules requested by the user:

## 1. Aesthetic Restrictions (STRICT)
- **NO emojis**: Never use emojis anywhere in the interface, buttons, titles, subtitles, status tags, or placeholders.
- **NO gradient UI**: Avoid gradient backgrounds, decorative text gradients, or high-contrast chromatic overlays. Default to flat, minimalist, clean high-contrast light and dark themes using custom solid color outlines, high-contrast typography, and generous negative space.

## 2. Mobile & Responsive Layout Requirements (STRICT)
- **Desktop-First Precision with Mobile-First Quality**: All components, modals, filters, and dynamic lists must be fully responsive and perfectly aligned on smaller viewports.
- **Width Boundaries**: Use responsive container constraints (e.g., `max-w-md`, `max-w-xl`, or standard fluid grid blocks) with appropriate mobile padding (`px-4`, `px-6`, `py-4`) to ensure nothing overflows horizontally on 320px–480px width screens.
- **Form Controls & Inputs**: Ensure standard input text, dropdown selections, buttons, and custom badges resize comfortably, stack vertically under responsive prefixes (e.g., `flex-col sm:flex-row`), and feature spacious tap targets (at least 44px on mobile screens).
- **Text & Alignment**: Make sure display headings wrapping is handled properly without word breaking issues, using tailwind classes such as `break-words` or `hyphens-auto` where relevant to maintain a pristine aesthetic on tight screens.
