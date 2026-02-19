# MatchVaga

Analyze the gap between your resume and job descriptions. Identify missing skills and generate an optimized document tailored to each vacancy.

## What It Does

MatchVaga helps job seekers:

- **Compare** their curriculum vitae against vacancy requirements
- **Identify** skill gaps and missing qualifications
- **Generate** an optimized document aligned with the job description

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui (Radix, Base UI)
- **Language:** TypeScript (strict mode)

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
├── app/           # Next.js App Router (pages, layout)
├── components/    # UI components (shadcn/ui)
└── lib/           # Utilities and shared logic
```

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

## License

Private project.
