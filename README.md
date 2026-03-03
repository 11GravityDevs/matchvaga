# MatchVaga

Analyze the gap between your resume and job descriptions. Identify missing skills and generate an optimized document tailored to each vacancy.

## What It Does

MatchVaga helps job seekers:

- **Compare** their curriculum vitae against vacancy requirements
- **Identify** skill gaps and missing qualifications
- **Generate** an optimized document aligned with the job description

## Tech Stack

| Layer                  | Technology                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Framework              | Next.js 16 (App Router)                                                                   |
| React                  | React 19                                                                                  |
| Auth                   | Supabase Auth (email OTP, Google OAuth)                                                   |
| Backend                | Server Actions, Supabase (Postgres + Storage)                                             |
| AI/LLM                 | Gemini 1.5 Flash (extraction), GPT-4o-mini (scoring, chat), Claude 3.5 Sonnet (synthesis) |
| Validation             | Zod                                                                                       |
| Data fetching (client) | TanStack Query v5                                                                         |
| Styling                | Tailwind CSS v4                                                                           |
| UI Components          | shadcn/ui (radix-vega style), Base UI, Radix UI                                           |
| Icons                  | lucide-react                                                                              |
| Utils                  | clsx, tailwind-merge, class-variance-authority                                            |

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd matchvaga-frontend

# Install dependencies

yarn install

```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── app/           # App Router pages, layouts, route groups; route-specific in _components/, _utils/, _hooks/, _constants/, _contexts/, _actions/
│   └── actions/   # Shared Server Actions (resume, job, analysis, document, chat)
├── components/    # ui/ (shadcn primitives) + shared/ (cross-feature components)
├── constants/     # Shared constants (auth, design-tokens, routes, etc.)
├── contexts/      # React Context providers
├── hooks/         # Shared custom hooks (logic layer)
├── lib/           # Supabase client + AI utilities (server-only) + query/ (get-query-client, query-options)
├── schemas/       # Zod schemas for Server Action validation
├── utils/         # Shared utilities (style, auth, etc.)
└── types/         # Shared TypeScript interfaces
```

### Route Architecture

| Route Group   | Purpose                          |
| ------------- | -------------------------------- |
| `(auth)/`     | Login (email → token flow)       |
| `(legal)/`    | Privacy policy, Terms of service |
| `onboarding/` | Resume upload → verify flow      |
| `dashboard/`  | Main app after onboarding        |

### Path Aliases

- `@/components` — Components (ui/, shared/)
- `@/lib/supabase` — Supabase client (client, server)
- `@/lib/logger` — Server-side error logger (stderr, JSON; use only in server code)
- `@/lib/ai` — AI prompts and client wrappers (server-only)
- `@/lib/query` — Query client, query options
- `@/constants` — Shared constants
- `@/contexts` — Context providers
- `@/hooks` — Custom hooks
- `@/utils/style` — cn() helper (clsx + tailwind-merge)
- `@/utils/auth` — Auth utilities
- `@/types` — Shared type definitions

Route-local utils/hooks/constants use relative imports (e.g. `./_utils/...`, `../_hooks/...`).

## Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `dev`         | Start development server       |
| `build`       | Build for production           |
| `start`       | Start production server        |
| `lint`        | Run ESLint                     |
| `format`      | Format code with Prettier      |
| `check-types` | Check TypeScript typing errors |

## Pre-commit

Husky runs a pre-commit hook that:

1. **lint-staged** — Formats and lints staged files (Prettier + ESLint)
2. **tsc --noEmit** — Type-checks the project

The commit is blocked if there are ESLint or TypeScript errors.

## Monitoring & Logs

Server-side errors (AI failures, database errors, server actions, API routes) are logged with a consistent JSON format via `logServerError` in `src/lib/logger.ts`. Logs are written to stderr (`console.error`), so they are captured by the host (e.g. Vercel).

### Viewing logs on Vercel

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Logs** (or **Observability → Logs**).
3. Use **Runtime Logs** to see output from serverless functions and Server Actions.
4. Each error is a single JSON line with fields: `level`, `timestamp`, `context` (`ai` | `db` | `server_action` | `api`), `operation`, `message`, and optional `model`, `errorMessage`, `errorName`. You can filter or search by these fields in the Vercel UI.

## License

Private project.
