# Verification

Current hosting and migration evidence: [Vercel deployment](deployment.md). The Pages checks below describe the initial launch.

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

## Clipboard completion repair — 27 October 2026

Source inspection of `2bfa51508a1224db9cda6c721765991a8e24836d` found a completion race in `app.js`. Start copying plan A, close it and open B while the clipboard promise waits: A's later success can label B as copied, or its failure can insert A's fallback text and move focus into B. `openSession` resets the visible status but does not invalidate the pending operation. The copied-plan requirement still applies to the selected session.

The repair in `app.js` captures the selected session and copy generation, and
checks both plus `dialog.open` before either completion can change feedback,
fallback text or focus. Opening a plan, starting another copy and processing an
actual close invalidate older requests. Close handling clears references and
focuses only a connected trigger. A queued close event is ignored if another
plan is already open. Current-plan rejection still exposes the exact proposed
plan as selectable fallback text; a fresh copy clears older feedback.

The [HTML dialog closing algorithm](https://html.spec.whatwg.org/multipage/interactive-elements.html#close-the-dialog)
queues the close event after removing the open attribute. The source guard
therefore covers the closed interval before that event and a later reopen.
The [Clipboard API](https://www.w3.org/TR/clipboard-apis/#dom-clipboard-writetext)
starts an asynchronous write; this repair suppresses stale page effects and
does not cancel an OS clipboard operation already requested.

The new `tests/regression/clipboard.test.mjs` executes the actual application
listeners in a Node VM with mocked DOM and clipboard promises (T2 data). It uses
real `club.js` payload generation and checks user-visible status, fallback
content, focus and selection. It is not browser/native-dialog/permission proof.
On Node v26.8.2, the focused command below passed **25 tests**: 21 clipboard
regressions and four existing club tests. The same 21 clipboard cases against
immutable source `054013e39859d2724f9cad25ca5476ae98c190cd` produced **four passes
and 17 failures**. Baseline/fixed runs used the same harness and runner options.

```sh
node --test --test-isolation=none tests/regression/clipboard.test.mjs tests/club.test.mjs
```

`npm run check` passed all 10 public files, JavaScript syntax, local links,
assets, anchors and club configuration; `git diff --check` passed. Independent
review found no remaining concrete issue in the repair and focused cases. The
local HTTP test was not run; this change is entirely client-side. No browser,
OS clipboard, backend, dependency install or local build ran. Historical browser
results above retain their original scope. Source/hosted publication is pending.
