# playwright-fe-automation — Claude guide

## What this repo is

Frontend **UI E2E** suite (Playwright) for LearnYourBenefits. It drives the
Angular app (`lyb-v2-angular`) in a real browser — this is UI testing, not API
testing (that's `cypress-be-automation`). Results feed the **Frontend E2E** suite
in the combined Allure dashboard (the `allure-report` repo).

Read [README.md](README.md) first for setup, env, and layout.

## Golden rules

- **Never commit secrets.** Credentials live in a gitignored `.env` (from
  `.env.example`) or CI variables — never in specs or committed files.
- **`allure-results/` / `allure-report/` are gitignored** (generated). Don't
  commit them.
- **Match the surrounding style** (Page Object Model). No Prettier/ESLint is
  configured; mirror nearby files. Keep test bodies free of explanatory comments.
- Don't reformat unrelated lines when changing one thing.

## Conventions (follow when writing/fixing specs)

- **Import `test` from `fixtures/auth.fixture.js`** — not `@playwright/test`
  directly. It logs in once per worker and exposes `loginPage` and
  `authenticatedPage`. All specs use it; the Allure `parentSuite` label is set
  globally in `playwright.config.js`, not per-spec.
- **Page Object Model**: put selectors/actions in `pages/*.js`; specs call page
  methods and assert. Add new selectors to the page object, not inline in specs.
- **Env access via `requireEnv()`** (`utils/env.js`) so a missing var fails loud.
- **Test data** lives in `test-data/*.js` (`users`, `instances`, …). Reference it
  rather than hard-coding.
- **Prefer role/text locators** (`getByRole`, `getByText`) and Playwright
  web-first assertions (`await expect(...).toBeVisible()`); avoid brittle waits.
- **Selecting/running:**
  ```bash
  npx playwright test tests/instances/add-instance.spec.js
  npx playwright test --headed --project=chromium
  ```

## Env / how it runs

- `BASE_URL` (default `http://localhost:4200`) selects the frontend under test.
- `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` — a login user; the Docker seeders
  create `master.admin@learnyourbenefits.com` / `LybTest@2026`.
- `TEST_SITE_NAME` — a site the user sees post-login, matched by **exact
  displayed text**. Seeded Docker stack: `E2E e2e-main` (the site's title, not
  the `e2e-main` domain). If a spec fails/hangs at the post-login site check,
  this is usually the mismatch — align it to the seeded title, not the spec.

## Allure

`allure-playwright` writes `./allure-results`. `playwright.config.js` sets
`parentSuite = "Frontend E2E"` for every test via the reporter's `globalLabels`
(+ `suiteTitle:false`). Don't remove that — it's what groups the suite in the
dashboard.

## CI

- `azure-pipelines-staging.yml` (development) — boots the Docker stack **with the
  frontend** (`--profile frontend`), seeds, runs Playwright → uploads to
  `results/frontend-e2e/current` in Blob. Checks out three repos (this,
  `lyb-v2-laravel`, `lyb-v2-angular`).
- `azure-pipelines-production.yml` — gated scaffold (`trigger: none`).

Full deploy flow: the `allure-report` repo's `DEPLOYMENT.md`.
