# ECCS Labs Agent Instructions

## Quick Start

```bash
bun install              # Install dependencies
bun run dev              # Start Next.js dev server
bun run build            # Production build
bun run lint             # ESLint check
bun run start:dev [env]  # Start SST local dev (requires environment: staging, production, etc.)
```

## Environment Variables

Copy `.env.sample` to `.env.localdev` and set:

- `NEXT_PUBLIC_REGION`
- `NEXT_PUBLIC_PASS_SECRET_KEY`
- `AUTH_SECRET`
- `NEXT_PUBLIC_DOMAIN`
- `NEXT_PUBLIC_BASE_URL`

## Infrastructure

- **Framework**: SST v4 (Pulumi-based, not CDK)
- **Location**: `infra/` directory contains infrastructure code
- **Deploy**:
  ```bash
  bunx sst deploy --stage staging   # Staging
  bunx sst deploy --stage production # Production
  ```

## CI/CD

GitHub Actions workflows deploy on branch push:

- `staging` branch → staging environment
- `production` branch → production environment

Uses Bun, AWS OIDC authentication.

## Architecture

- **Framework**: Next.js 16 with App Router
- **Routing**: `src/app/` contains pages organized by role:
  - `/login`, `/signup` → auth routes
  - `/teacher/*` → educator features
  - `/student/*` → learner features
  - `/admin`, `/faculty` → management features
- **Components**: `src/presentation/` contains UI components
- **State**: Redux Toolkit in `src/store/`
- **Auth**: NextAuth v5 with JWT + refresh token strategy
- **Styling**: Tailwind CSS v4 (CSS-first config, no tailwind.config.js)

## Code Quality

- ESLint: extends `next/core-web-vitals`
- TypeScript: strict mode enabled
- Path alias: `@/*` maps to `src/*`
