# CohnReznick Advisory Analyst

AI-powered transaction diligence tool — upload a 36-month trial balance and supporting workpapers to get instant anomaly detection, driver analysis, follow-up questions, and an issue tracker.

## What it does

An analyst uploads an Excel trial balance and Word workpapers. The AI agent processes the files, detects unusual movements across all accounts, explains the root causes, surfaces follow-up questions for management, and builds a prioritised issue tracker — all in under two minutes. Results are saved per engagement and downloadable as a formatted Excel workbook.

## Run locally

```bash
cp .env.example .env.local   # fill in credentials
npm install
node node_modules/next/dist/bin/next dev -p 3002
```

Open http://localhost:3002

**Demo without credentials:** go to TB Ingestion and click **Load Sample Data**

## Environment variables

| Variable | Required | Where to get it |
|---|---|---|
| `LYZR_API_KEY` | Yes | Lyzr Studio → API Keys |
| `LYZR_AGENT_ID` | Yes | Lyzr Studio → Agents → CohnReznick Advisory Analyst |
| `LYZR_USER_ID` | Yes | Your Lyzr account email |
| `MONGODB_URI` | Yes | MongoDB Atlas or DocumentDB connection string |
| `MONGODB_DB_NAME` | No | Database name (default: `cohn_reznick`) |

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — insights, active engagements, quick actions |
| `/workflows/tb-ingestion` | Upload trial balance + workpapers, run analysis |
| `/workflows/anomaly-detection` | Anomaly findings with approve/dismiss CTAs |
| `/workflows/driver-analysis` | Root cause cards with cross-referenced accounts |
| `/workflows/follow-up-questions` | Prioritised questions for management |
| `/workflows/issue-tracker` | Collapsible issue table with status tracking |
| `/workflows/report-drafting` | 5-sheet Excel export |
| `/workflows/customers` | Saved engagement history from MongoDB |

## Deploy to Vercel

1. Push to GitHub
2. [vercel.com/new](https://vercel.com/new) → import repo → framework auto-detected
3. Add env vars: Project → Settings → Environment Variables
4. Deploy

## Built with

Next.js · Lyzr Agent API · Redux Toolkit · MongoDB · Tailwind CSS · shadcn/ui · framer-motion
