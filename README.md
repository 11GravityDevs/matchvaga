<div align="center">

# MatchVaga

**Stop guessing why your resume gets ignored. See exactly what's missing, then fix it.**

</div>

## The Problem

Job seekers apply to dozens of listings with the same generic resume and never learn why they get filtered out. Applicant tracking systems and recruiters scan for specific skills and keywords from the job description, and a resume that doesn't speak that language gets discarded before a human ever reads it.

## What MatchVaga Does

MatchVaga is an AI powered web app that closes that gap in three steps:

1. **Upload your resume once.** MatchVaga extracts your experience, education, and skills into structured data.
2. **Paste any job description.** The app extracts the required hard and soft skills from the listing and compares them against your profile, producing a compatibility score and a clear list of what's missing.
3. **Generate a tailored resume.** Using the gap analysis, MatchVaga rewrites and reorganizes your resume to highlight relevant experience and close keyword gaps, then exports it as a polished PDF or DOCX ready to send.

Every analysis is saved to a personal dashboard, so you can track how your compatibility score improves across applications over time.

## Screenshots

<table>
  <tr>
    <td><img src="public/dashboard.png" alt="Dashboard overview" width="400"/></td>
    <td><img src="public/analise-compatibilidade.png" alt="Compatibility analysis" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><sub>Dashboard</sub></td>
    <td align="center"><sub>Compatibility analysis</sub></td>
  </tr>
  <tr>
    <td><img src="public/curriculo-otimizado.png" alt="Optimized resume preview" width="400"/></td>
    <td><img src="public/analysis-history.png" alt="Analysis history" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><sub>Optimized resume preview</sub></td>
    <td align="center"><sub>Analysis history</sub></td>
  </tr>
</table>

## How It Works

```
Upload resume  ->  Extract structured data (AI)
                          |
Paste job post ->  Extract required skills (AI)
                          |
                    Gap analysis + score
                          |
              Generate tailored resume (AI)
                          |
                  Export as PDF / DOCX
```

A multi model pipeline is used on purpose, matching each step to the model best suited for it: fast structured extraction for parsing resumes and job posts, and a stronger reasoning model for the final resume synthesis.

## Key Features

- **Resume parsing**: upload a PDF or DOCX and get structured, editable data back (experience, education, skills, languages).
- **Job description analysis**: paste any job posting and extract the hard and soft skills it actually asks for.
- **Gap analysis**: a compatibility score plus a breakdown of matched, missing, and partially matched skills.
- **AI resume synthesis**: generates a resume tailored to a specific job description, not a generic rewrite.
- **Document export**: download the optimized resume as PDF or DOCX.
- **Analysis history**: every comparison is saved and revisitable from the dashboard.
- **Authentication**: email OTP and Google OAuth sign in via Supabase Auth.
- **Credits and checkout**: pay per analysis or in bundles through Stripe, with credits tracked per account.

## Tech Stack

| Layer           | Technology                                                              |
| --------------- | ----------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router)                                                 |
| UI              | React 19, Tailwind CSS v4, shadcn/ui, Radix UI                          |
| Auth & Database | Supabase (Postgres, Auth, Storage, Row Level Security)                  |
| Payments        | Stripe Checkout + webhooks                                              |
| AI / LLM        | Gemini 2.5 Flash Lite, Claude Haiku 4.5, GPT 4o mini, Claude Sonnet 4.6 |
| Data fetching   | TanStack Query v5                                                       |
| Validation      | Zod                                                                     |
| Analytics       | PostHog                                                                 |
| Documents       | react-pdf, docx, mammoth                                                |
| Testing         | Vitest                                                                  |

## Architecture Highlights

- **Server Actions** handle all mutations and AI calls; every action re-validates input with Zod and re-authenticates the user server side rather than trusting the client.
- **Row Level Security** is enabled on every Supabase table, so data access is enforced at the database layer, not just in application code.
- **AI calls are server only**; provider API keys never reach the browser.
- **Stripe webhook** verifies the request signature before granting credits, using a service role Supabase client isolated to that single code path.

## Project Structure

```
src/
  app/         App Router pages, layouts and route groups
    actions/   Server Actions (resume, analysis, document, user)
    api/       Route handlers (Stripe webhook)
  components/  ui/ (shadcn primitives) and shared/ (cross feature components)
  constants/   Shared constants (auth, routes, checkout packages, site config)
  contexts/    React Context providers
  hooks/       Shared custom hooks
  lib/         Supabase clients, AI clients and prompts, analytics, logger
  schemas/     Zod schemas for Server Action validation
  utils/       Shared utilities
  types/       Shared TypeScript types
supabase/
  migrations/  SQL schema and Row Level Security policies
```

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- A Supabase project and a Stripe account (for local development against real services)

### Installation

```bash
git clone <repository-url>
cd matchvaga-frontend
yarn install
```

Copy `.env.example` to `.env.local` and fill in your own Supabase, Stripe, AI provider, and PostHog keys.

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

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `yarn dev`         | Start the development server   |
| `yarn build`       | Build for production           |
| `yarn start`       | Start the production server    |
| `yarn lint`        | Run ESLint                     |
| `yarn format`      | Format code with Prettier      |
| `yarn check-types` | Type check the project         |
| `yarn test`        | Run the test suite with Vitest |

## License

This project is publicly viewable for portfolio purposes. See [LICENSE](LICENSE): all rights are reserved and no reuse is permitted without written permission.
