# Football Results Fetcher

Automated end-to-end tests for fetching football results from Sky Sports using [Cypress](https://www.cypress.io/).

The test suite navigates Sky Sports and Olé, accepts or dismisses consent popups, opens football scores, and checks Manchester City and Atlético Tucumán results.

---

## Prerequisites

Make sure the following are installed on your machine before getting started:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes bundled with Node.js)
- [Google Chrome](https://www.google.com/chrome/) (Cypress uses it by default)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lucgar76/football-results-cypress.git
cd football-results-cypress
```

### 2. Install dependencies

```bash
npm install
```

This installs Cypress, TypeScript, and ts-node locally inside `node_modules/`. No global installs are needed.

---

## Running the Tests

### Headless mode (recommended for CI or quick runs)

Runs all tests in the terminal without opening a browser window:

```bash
npm test
```

or equivalently:

```bash
npm run cypress:run
```

### Interactive mode (recommended for development and debugging)

Opens the Cypress Test Runner UI so you can watch the browser navigate step by step:

```bash
npm run test:open
```

or equivalently:

```bash
npm run cypress:open
```

In the Cypress UI:
1. Select **E2E Testing**
2. Choose **Chrome** as the browser
3. Click a spec under `cypress/e2e` to run it

---

## Test Overview

| File | Description |
|------|-------------|
| `cypress/e2e/skysports-results-mancity.cy.ts` | Navigates Sky Sports → Scores → Football → Manchester City → Premier League table |
| `cypress/e2e/ole-resultados-at.cy.ts` | Navigates Olé → Olé Resultados → Liga Profesional standings → Atlético Tucumán |

### What the Sky Sports test does

1. Visits [skysports.com](https://www.skysports.com/)
2. Accepts the cookie consent popup
3. Opens the **Scores** menu and chooses **Football**
4. Lands on **Football Scores & Fixtures**
5. Opens the **Teams** dropdown and selects **Manchester City**
6. Clicks through to **Manchester City Scores & Fixtures**
7. Clicks **View table** to reach the **Premier League table** page

### What the Olé test does

1. Visits [ole.com.ar](https://www.ole.com.ar/) and dismisses overlays
2. Clicks **Olé Resultados**
3. Opens **Liga Profesional** with **Ver tabla**
4. Opens **Atlético Tucumán** and checks the Resultados tab

---

## Project Structure

```
football-results-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── skysports-results-mancity.cy.ts   # Sky Sports → Man City
│   │   └── ole-resultados-at.cy.ts           # Olé → Atlético Tucumán
│   └── support/
│       └── e2e.ts                             # Cypress support file
├── src/                                       # TypeScript source (non-test code)
├── cypress.config.ts                          # Cypress configuration
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

**Tests fail due to cookie popup not dismissing**
The Sky Sports cookie popup loads inside an iframe and can be slow. The tests use generous timeouts (up to 15 s) to handle this. If you are on a slow connection, retrying usually resolves it.

**`chromeWebSecurity` is disabled**
This is required because the cookie consent popup is served from a cross-origin iframe (`privacy-mgmt`). This setting is already configured in `cypress.config.ts`.

**Cypress can't find a browser**
Make sure Google Chrome is installed. Alternatively, run with Firefox:
```bash
npx cypress run --browser firefox
```
