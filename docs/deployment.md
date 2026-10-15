# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://happy-run-six.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `happy-run`, `prj_Tr942P7kgAHek31WX5a9466tKMXO`.
- Source: `alvarovillalbaa/happy-run`, production branch `main`, repository root.
- `vercel.json` runs `npm run build` without installing dependencies and serves `dist/`. The builder copies only `scripts/public-files.mjs` entries; repository docs, tests and scripts are excluded.
- No environment variables or custom domain are required. The site uses `/`; 404 recovery and sharing URLs target the Vercel production domain.

GitHub Pages cutover and final deployment verification are recorded below after the migrated source is published. Earlier Pages/browser results remain historical evidence in [verification.md](verification.md).
