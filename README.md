# Happy Run · Madrid

A complete Spanish-language website for Happy Run, a new social run club in Madrid. Original identity, responsive layouts, filterable session proposals, accessible run-detail dialogs, real map destinations, copyable plans, a newcomer guide, privacy information and a custom 404 page.

Built with semantic HTML, CSS and browser-native JavaScript modules. There are **no package dependencies, build step, third-party scripts, registration backend or required environment variables**. Fonts and imagery are included locally.

## Run locally

Requires Node.js 22 or newer. No installation is needed.

```sh
npm start
```

Open `http://127.0.0.1:4173/happy-run/`. Set `PORT` if 4173 is already in use. The local server binds to loopback by default and serves only the explicitly listed public files.

## Verify

```sh
npm run check
npm test
git diff --check
```

Static checks validate JavaScript syntax, local assets, page links, anchors and club configuration. The focused tests cover filtering, honest sharing of unconfirmed proposals, map destinations, unsafe configuration and local HTTP behavior. Browser verification is recorded in [docs/verification.md](docs/verification.md).

## Edit the club

- **Sessions and official links:** edit [club.js](club.js). All three initial sessions are proposals, with `confirmed: false`. Day, time, distance, pace and meeting point need the organizer's confirmation. Do not mark them confirmed just to remove the launch notice.
- **Community links:** add real HTTPS destinations to `club.community`. The community section then displays those links. No social handles, member counts, testimonials or partners are fabricated.
- **Copy and layout:** edit [index.html](index.html) and [styles.css](styles.css).
- **Photos:** replace `assets/happy-run-madrid.jpg` with an owned or appropriately licensed club photo. Update its alt text and the conceptual-image disclosure in `index.html` and `privacy.html` together.
- **Brand mark:** `assets/smile.svg` is an original editable SVG.

The default launch state is intentional: people can explore proposals, open the areas in Maps and copy proposed plans, but are told to wait for confirmation before attending. The site does not claim to register anyone or collect an email address.

## Publish

The project works from a static host, including the GitHub Pages subpath `/happy-run/`. No deployment workflow or cloud services are required. The repository root contains the ready-to-serve site; `.nojekyll` prevents Jekyll processing.

For GitHub Pages, enable **Deploy from a branch → main → /(root)** in repository Settings → Pages. Do this only with the owner's deployment authorization. The expected address is `https://alvarovillalbaa.github.io/happy-run/`.

For a different repository name or domain, update the Open Graph URLs in `index.html`, the home link in `404.html`, and the optional local project prefix in `scripts/serve.mjs`. Use HTTPS in production for Clipboard API support; a manual text-selection fallback is provided.

## Sources and handoff

- [Design research and decisions](docs/design.md)
- [Verification and known limits](docs/verification.md)
- [Image and font provenance](docs/assets.md)

The club name, city and public GitHub publication were supplied or confirmed by the owner. Proposed run schedules and meeting points remain editorial assumptions pending confirmation. GitHub publication is distinct from a confirmed real-world club launch.
