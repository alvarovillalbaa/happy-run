# Verification

Verified on 15 October 2026 against the source in this repository and the deployed GitHub Pages website.

## Publication evidence

- Public repository: [alvarovillalbaa/happy-run](https://github.com/alvarovillalbaa/happy-run).
- Live site: [Happy Run Madrid](https://alvarovillalbaa.github.io/happy-run/).
- First deployed source commit: `23c0f1e8043d0a7d5ed91e4d9c68afd9777593de`.
- GitHub Pages source: `main`, repository root, native branch deployment.
- [First deployment run](https://github.com/alvarovillalbaa/happy-run/actions/runs/38742295994): `completed`, `success`; Pages build API: `built`, no error.
- Owner explicitly authorized GitHub Pages deployment after reviewing the uploaded project.

## Checks completed

| Check | Observed result |
| --- | --- |
| `npm run check` | Pass: JS syntax; all 10 public files; local links, assets, anchors and config. |
| `npm test` | Pass: 5 focused tests covering honest proposal sharing, filtering, map queries, config rejection and local HTTP behavior. |
| `git diff --cached --check` | Pass. Upstream font license spacing is preserved with a path-specific Git attribute. |
| Desktop Chrome, 1440 × 812 | Homepage, locally hosted font and all images rendered. No horizontal overflow. |
| Phone viewport, 390 × 844 | Homepage, mobile menu, menu-link dismissal, run list and detail dialog rendered and operated correctly. |
| Narrow phone viewport, 320 × 740 | Layout rendered without horizontal overflow. |
| Tablet viewport, 768 × 1024 | Desktop navigation and two-column hero rendered without horizontal overflow. |
| Run filters | All = 3 plans; social = 2; longer run = 1; returning to all restored 3. |
| Detail dialog | Correct selected title, proposed status, time, pace, meeting point, description and map destination. |
| Copy plan | Browser displayed the successful copy message after clicking; shared text retains proposal warnings. |
| Keyboard interaction | Escape closed the native dialog and restored focus to the originating run card. |
| FAQ | Expanding a question revealed its answer. |
| Privacy page | Footer link opened the deployed privacy and credits page. |
| Custom 404 | Deliberately missing URL rendered the custom page; its home link returned to the club. |
| Application console | No warnings/errors attributed to the deployed site. Browser-extension warnings were excluded. |

Browser checks used the deployed site because a direct local `npm start` preview was denied permission to bind to port 4173 in the execution sandbox. The local HTTP server's focused test did pass. Local-file browser navigation was also blocked by browser policy; it was not retried or circumvented. The authorized public HTTPS deployment provided the browser test surface.

Temporary viewport overrides were reset after verification.

## Rendered evidence

- [Desktop homepage](preview-desktop.jpg)
- [Phone homepage](preview-mobile.jpg)
- [Run detail panel](preview-run-detail.jpg)

## Launch assumptions

- Club name and city: Happy Run, Madrid, supplied by owner.
- Public GitHub repository and local browser verification: authorized by owner.
- All session times, meeting points, distances and paces: proposed, not yet owner-confirmed.
- Official social links and contact details: not supplied, so no invented destinations are shown.
- No signup or attendance backend is represented.

## Verification limits

Chrome with responsive viewport overrides was checked; physical devices, Safari and Firefox were not tested. This is not a full accessibility or performance audit. The clipboard failure fallback is implemented but was not forced during the live browser check. Real routes, organizer permissions and real-world events have not been verified and are not represented as confirmed. The owner explicitly requested placeholders until those details are available.
