# Ausleihe

This project now runs on [Angular CLI](https://github.com/angular/angular-cli) 21.

## Setup and verification

Use Node.js 24 LTS (`nvm install && nvm use`) and the npm version declared in
`package.json`:

```bash
npm install --global npm@11.20.0
npm ci
npm run lint
npm run test:security
npm run build
npm run build:production
npm run test:ci
npm audit
```

`test:ci` needs Chrome or Chromium. Set `CHROME_BIN` if it is not automatically
detected. GitHub Actions runs these checks, including the application tests in
ChromeHeadless, for pushes and pull requests. Security regression tests cover
Glob cancellation, Minimatch expansion limits, file-discovery compatibility,
and the locally patched Picomatch dependency.

The Picomatch advisory GHSA-fc5q-39xc-vjpf has no upstream patched release as of
2026-11-17. All consumers use the source-vendored security fork documented in
[vendor/picomatch/SECURITY-PATCH.md](vendor/picomatch/SECURITY-PATCH.md). Replace
it with a verified upstream fix when available; do not remove the override
without rerunning the security tests.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build:production` to create an optimized production build. The
browser files are written to `dist/Ausleihe/browser`. `npm run build` also
checks the default build configuration.

## Linting

Run `ng lint` to lint the application with ESLint.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

For a one-shot local run without watch mode:

```bash
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test -- --watch=false --browsers=ChromeHeadless
```

The current suite is intentionally small and focused on the main application behavior:

- `src/app/app.component.spec.ts`: app shell rendering and configured title.
- `src/app/buecherliste/*.spec.ts`: category/book loading, lending flow, sorting, notification request, and Baqend query wiring.
- `src/app/signup/signup.component.spec.ts`: signup, login failure handling, and redirect behavior for logged-in users.
- `src/app/me/me.component.spec.ts`: admin view initialization, returning books, adding books, and logout.
- `src/app/chats/**/*.spec.ts`: message loading, route-based detail loading, and image URL creation.

These tests isolate Baqend and HTTP dependencies with mocks, so they run as unit tests and do not require a live backend.

## End-to-end tests

Legacy Protractor-based end-to-end tests were removed during the Angular 21 upgrade because Protractor is end-of-life. No replacement e2e runner is configured yet.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
