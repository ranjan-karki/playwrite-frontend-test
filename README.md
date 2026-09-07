# playwright-fe-automation

Frontend **UI E2E** test suite for LearnYourBenefits (LYB), written in
[Playwright](https://playwright.dev/). It drives the Angular app (`lyb-v2-angular`)
in a real browser. Results are reported via Allure and feed the **Frontend E2E**
parent suite in the combined Allure dashboard (the `allure-report` repo) — next to
**Backend Unit** and **Backend E2E**.

- Tests under `tests/`, organised by feature (`instances/`, `login/`), using the
  Page Object Model in `pages/`.
- Runs against any LYB frontend — a local Angular dev server, the Dockerized
  stack, or staging — selected by `BASE_URL`.
- No secrets committed. Credentials come from a gitignored `.env` (or CI vars).

---

## Prerequisites

- **Node.js 20+** (CI uses 22).
- A reachable **LYB frontend** at `BASE_URL`, backed by an API with the E2E
  fixtures seeded. Pick one:
  - **Docker** — the `lyb-v2-laravel/docker` stack with `--profile frontend`
    (brings up the API + Angular at `:4200`).
  - **Local** — your own `ng serve` + a local backend.
  - **Staging** — the deployed frontend URL.

## Quick start

```bash
npm install
npx playwright install --with-deps chromium

cp .env.example .env      # then fill in BASE_URL + the login user + site name

npm test                  # headless
npm run test:headed       # headed
npm run test:ui           # Playwright UI mode
npm run report            # open the last HTML report
```

`.env` is **gitignored** — create it from `.env.example` after cloning.

## Configuration (`.env` / env vars)

| Var | Meaning |
|-----|---------|
| `BASE_URL` | Frontend under test (default `http://localhost:4200`) |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | A login user on the target backend (Docker seeders create `master.admin@learnyourbenefits.com` / `LybTest@2026`) |
| `TEST_SITE_NAME` | Display name of a site the user sees after login (seeded Docker stack: `E2E e2e-main`) |

`utils/env.js` `requireEnv()` throws a clear error if any required var is missing.

## Project layout

```
tests/               # specs by feature (instances/, login/)
pages/               # Page Object Model (LoginPage, SitesPage, …)
fixtures/
  auth.fixture.js    # the shared `test` — logs in once per worker, exposes
                     # loginPage / authenticatedPage; every spec imports this
test-data/           # users, instances, message, securityPayloads
utils/               # env.js (requireEnv), basicUtils.js
playwright.config.js # baseURL, projects, reporters (html + allure)
```

Every spec imports `test` from `fixtures/auth.fixture.js`, which logs in once per
worker and shares the authenticated page.

## Allure reporting

`allure-playwright` writes `./allure-results` on every run. Every test's
`parentSuite` label is set to **`Frontend E2E`** — via a `parentSuite()` call in
the shared `auth.fixture.js` (every spec imports it) plus `suiteTitle:false` in
the reporter config — so it groups next to the backend suites in the combined
dashboard. Preview locally:

```bash
npm run report:allure       # allure generate + open (needs Java + allure CLI)
```

## CI pipelines

| File | Trigger | What it does |
|------|---------|--------------|
| `azure-pipelines-staging.yml` | merge to `development` | Boots the LYB Docker stack **with the frontend** (`--profile frontend`: app + mysql + redis + postgres + angular), seeds fixtures, runs Playwright against `:4200`, uploads results to Blob `results/frontend-e2e/current`. |
| `azure-pipelines-production.yml` | (gated scaffold) | Production line → `results/prod/frontend-e2e/current`. Not yet enabled. |

The upload feeds the Allure publisher in the `allure-report` repo; the full flow
is documented in that repo's `DEPLOYMENT.md`.

> The staging pipeline checks out **three** repos — this one, `lyb-v2-laravel`
> (backend), and `lyb-v2-angular` (frontend, mounted via `ANGULAR_ROOT` so the
> `angular` service can `ng serve` it).

## The `.github/workflows/playwright.yml`

The repo also carries Playwright's default GitHub Actions workflow. The Azure
pipelines above are the ones wired into the Allure dashboard; the GitHub workflow
is independent (and needs a running frontend to be useful).
