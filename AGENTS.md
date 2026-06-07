<!-- # ECCS Labs Agent Instructions

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
- Path alias: `@/*` maps to `src/*` -->

# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## Context7

When you need to search docs, use `context7` tools.
