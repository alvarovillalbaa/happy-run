# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://happy-run-six.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `happy-run`, `prj_Tr942P7kgAHek31WX5a9466tKMXO`.
- Source: `alvarovillalbaa/happy-run`, production branch `main`, repository root.
- `vercel.json` runs `npm run build` without installing dependencies and serves `dist/`. The builder copies only `scripts/public-files.mjs` entries; repository docs, tests and scripts are excluded.
- No environment variables or custom domain are required. The site uses `/`; 404 recovery and sharing URLs target the Vercel production domain.

The cutover below supersedes the original GitHub Pages hosting. Earlier Pages/browser results remain historical evidence in [verification.md](verification.md).

## Verified cutover

- **Target / status:** production / READY, Git-triggered deployment from `26a838a9792fb1f853cbd7b0a0ddbb619bb14891`.
- **Deployment:** [dpl_6mRy9J11VBnuiggEUa3S3RBdj79R](https://vercel.com/my-team-4f230354/happy-run/6mRy9J11VBnuiggEUa3S3RBdj79R); framework Other (static HTML); build duration 1.9s.
- **HTTP:** 15 production URL checks matched expectations, including 5 expected 404s. 10 downloaded public files matched source bytes. See [machine-readable results](deployment-verification.json).
- **GitHub:** `main` push triggered the deployment automatically; the repository homepage now points to Vercel. Pages is disabled (`has_pages: false`), and the former Pages URL returns HTTP 404. No old-URL redirect is configured.
- **Checks:** `npm run check`, `npm run build`, and all 5 focused tests passed. `git diff --check` passed.
- **Observability:** the last-hour Vercel runtime-error scan returned no errors. Drains inventory returned HTTP 404, so drains/continuous monitoring are unverified. Static delivery and HTTP checks do not prove browser interactions or physical audio output.

The migration adds no dependencies or required environment variables. Browser interaction QA was not rerun against these Vercel sites; earlier browser evidence remains scoped to its original deployment. The following evidence-only commit may trigger a fresh build; the source commit above identifies the fully checked migration build.
