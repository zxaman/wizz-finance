# Wizz Finance

Wizz Finance (Paygate) is an Angular 21 application inside an Nx monorepo. It is organized around reusable design tokens, UI components, utilities, and remittance state so product experiences can share a common foundation.

## Run Wizz Finance locally

From the repository root, install the locked dependencies and start the primary application:

```bash
npm ci --legacy-peer-deps
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
- Zone.js is loaded as a build polyfill because the app uses `provideZoneChangeDetection()`
- `@lucide/angular` icons
- SCSS design tokens with white-label brand configuration

## Troubleshooting: Zone.js / blank screen

The Wizz Finance build declares `zone.js` as a dependency and loads it as a polyfill for `provideZoneChangeDetection()`. If the dev server reports `Failed to resolve import "zone.js"` or the browser shows Angular `NG0908`, the local install/cache is stale. From the repository root, run:

```bash
npm ci --legacy-peer-deps
```

Then stop and restart the dev server with `npm start`. If Vite still references an old generated entry, stop the server, remove the `.angular/vite-root` cache, and start again. In PowerShell:

```powershell
Remove-Item -Recurse -Force .angular/vite-root
npm start
```

## Vercel deployment note

Vercel should use the repository root with the build command `npm run build`. The supplied log checks out commit `56162a1`, which predates the fixes for both the missing animation runtime and Zone.js setup. Deploy the latest `main` revision so Vercel uses the current `package.json`, lockfile, and app polyfill configuration.
