# Happy Run maintenance

- This is a dependency-free static website. Keep HTML, CSS and browser-native JS modules unless a requirement warrants a different stack.
- Read `README.md` and `docs/design.md` before changing the product.
- `club.js` owns session details, confirmation flags and official community links.
- Keep proposed sessions visibly proposed in the list, details and copied text. Do not invent attendance, testimonials, partners, contacts or signup delivery.
- The owner requested placeholders until real schedules and links are available.
- Preserve conceptual-image disclosures until a real, appropriately licensed photo replaces the generated asset.
- Use relative asset paths for pages and root paths for the 404 page. Vercel serves the site at `/`.
- Keep keyboard focus, native dialog behavior, reduced-motion support and narrow mobile layouts functional.
- Run `npm run check`, `npm test` and `git diff --check` for relevant changes. No package installation or build is needed.
- `scripts/public-files.mjs` owns the public file allowlist used by the local server and asset checker.
- Vercel deploys `main` automatically on Clous Team (Pro). `vercel.json` and `scripts/public-files.mjs` define the published output. Commit/push only when authorized; changes to `main` affect the live website.
- Record substantive checks and limits in `docs/verification.md`. Keep docs focused and factual.
