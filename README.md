# Wizz Finance

Wizz Finance (Paygate) is an Angular 21 application inside an Nx monorepo. It is organized around reusable design tokens, UI components, utilities, and remittance state so product experiences can share a common foundation.

## Run Wizz Finance locally

From the repository root, install dependencies and start the primary application:

```bash
npm install --legacy-peer-deps
npm start
```

Then open **http://localhost:4200**. The development server watches source files and rebuilds as you edit.

`npm start` runs `nx serve wizz-finance`. The equivalent direct Nx command is:

```bash
npx nx serve wizz-finance --port=4200
```

To bind the server to all interfaces (for containers, remote previews, or LAN access), use:

```bash
npx nx serve wizz-finance --host=0.0.0.0 --port=4200
```

## Build

Build the production Wizz Finance app with:

```bash
npm run build
```

This runs `nx build wizz-finance`; generated files are written to `dist/apps/wizz-finance`.

Useful Nx commands:

```bash
npx nx show projects                 # List workspace projects
npx nx build wizz-finance            # Build the primary app
npx nx serve wizz-finance            # Serve the primary app on port 4200
npx nx graph                         # Open the project dependency graph
```

## Workspace layout

- `apps/wizz-finance/` — Paygate application, routes, feature pages, and public assets.
- `apps/wizz-partner-portal/` — White-label partner portal scaffold and brand-specific experience.
- `libs/shared/design-tokens/` — Brand configuration, theme signals, and SCSS tokens.
- `libs/shared/ui/` — Reusable standalone Angular UI components.
- `libs/shared/utils/` — Shared validation, formatting, and product catalogs.
- `libs/remittance/data-access/` — Remittance models and signal-based application store.
- `libs/remittance/feature-shell/` — Shared authentication and application shells.
- `public/` — Source design boards and flow notes used to implement the screens.

The active Paygate entry route currently presents the responsive landing page; account-entry routes are available from its Login and Sign Up actions. Feature components for subsequent flows are in the app source and are being connected incrementally.

## Tech stack

- Angular `^21.2.0` and Nx `^24.0.6`
- Standalone components, Angular Signals, and lazy-ready app structure
- `@lucide/angular` icons
- SCSS design tokens with white-label brand configuration

## Vercel deployment note

Vercel should use the repository root with the build command `npm run build`. The build log that reported `Could not resolve "@angular/animations/browser"` was produced from commit `56162a1`, before the animation-provider fix was merged. The current app configuration does not register `provideAnimationsAsync()` (the UI uses CSS transitions), so redeploy the latest `main` commit rather than retrying that older source revision.
