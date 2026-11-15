# Frontend workflow

- Preserve the landing's El Salvador and urban mobility identity: the night map, route line, forest and paper surfaces, and real StellarTraffic prototype imagery. Change that visual direction only when the brief asks.
- Use `angular-developer` for Angular 22 standalone components, signals, accessibility, and prerender-safe code. Keep the existing SSR/static build path working.
- Use `frontend-design` and `ui-ux-pro-max` when exploring a new visual direction; reject generated defaults that do not fit the product. Use `impeccable` for scoped visual refinement and `web-design-guidelines` for navigation and interaction reviews.
- Keep motion purposeful, interruptible, and respectful of `prefers-reduced-motion`. Do not add decorative gradients, glows, repeated eyebrow labels, or fake links.
- Before finishing frontend work, run the production build and check 320, 375, 768, and 1440 px layouts, keyboard focus, navigation, dialogs, and reduced motion. Use `web-quality-audit` and `performance` for Lighthouse; label localhost results as lab measurements, not field data.
- Use only supplied facts. Do not invent contact details or live traffic claims; identify StellarTraffic as a prototype in development.
