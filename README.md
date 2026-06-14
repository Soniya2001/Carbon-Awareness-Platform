# 🌱 CarbonWise AI — Your Personal Sustainability Coach

> **PromptWars Edition** · Built with Next.js 15 · Gemini AI · 100% LocalStorage · Deploy to Cloud Run

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Flash-4285f4?logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

**CarbonWise AI** is a production-ready, competition-grade sustainability platform that helps individuals understand, track, and reduce their carbon footprint through:

- 🧮 **Multi-category carbon calculator** with 50+ emission factors
- 🤖 **AI Sustainability Coach** powered by Google Gemini
- 🔮 **Carbon Twin AI** — simulate your future environmental impact
- 📈 **Forecast Engine** — predict next 1–12 months with confidence scores
- 🎯 **AI Eco Challenges** — Gemini-generated personalised missions
- 🏆 **Gamification** — Eco Points, 5 levels, 9 achievement badges, streaks
- 🌍 **Community Impact Simulator** — see collective impact at scale
- 🌙 **Dark/Light mode** with WCAG 2.1 AA accessibility

> **No account, no sign-up, no backend, no database required.**  
> Everything persists in your browser's localStorage.  
> Only dependency: your Gemini API key.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CarbonWise AI                            │
│                     Next.js 15 App Router                       │
├────────────────┬────────────────┬───────────────────────────────┤
│   UI Layer     │  State Layer   │      Core Engines             │
│                │                │                               │
│  Tailwind CSS  │  Zustand Store │  carbonEngine.ts              │
│  ShadCN UI     │  useAppStore   │  • EMISSION_FACTORS           │
│  Framer Motion │                │  • calcCO2()                  │
│  Recharts      │                │  • carbonScore()              │
│                │                │  • sustainabilityScore()      │
│                │                │                               │
│                │                │  simulationEngine.ts          │
│                │                │  • runSimulation()            │
│                │                │  • forecastFromHistory()      │
│                │                │  • communityImpact()          │
│                │                │                               │
│                │                │  storage.ts                   │
│                │                │  • localStorage CRUD          │
│                │                │  • gamification logic         │
│                │                │  • badge management           │
│                │                │                               │
│                │                │  gemini.ts                    │
│                │                │  • explainFootprint()         │
│                │                │  • chatWithCoach()            │
│                │                │  • generateAIChallenge()      │
│                │                │  • generateTwinNarrative()    │
├────────────────┴────────────────┴───────────────────────────────┤
│              Browser localStorage (single-user)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
carbonwise-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Onboarding / landing
│   │   ├── dashboard/          # Main analytics dashboard
│   │   ├── calculator/         # Carbon footprint calculator
│   │   ├── carbon-twin/        # Carbon Twin AI simulator
│   │   ├── forecast/           # Forecast engine + charts
│   │   ├── challenges/         # Eco challenge management
│   │   ├── community/          # Community impact simulator
│   │   ├── ai-coach/           # AI chat interface
│   │   ├── achievements/       # Badges, streaks, levels
│   │   └── settings/           # Preferences + API key
│   │
│   ├── components/
│   │   ├── ui/                 # ShadCN-style base components
│   │   ├── charts/             # Recharts wrappers (Pie, Line, Area, Bar)
│   │   ├── features/           # Feature components
│   │   │   ├── ActivityLogger  # Carbon activity form
│   │   │   ├── AICoach         # Gemini chat interface
│   │   │   ├── CarbonTwin      # Simulation UI
│   │   │   ├── ForecastPanel   # Forecast display
│   │   │   ├── ChallengeCard   # Challenge management
│   │   │   └── KPICard         # Animated metric cards
│   │   └── layout/
│   │       ├── Sidebar         # Collapsible navigation
│   │       ├── Header          # Top bar with badge alerts
│   │       └── DashboardShell  # Main layout wrapper
│   │
│   ├── lib/
│   │   ├── carbonEngine.ts     # Emission factors & calculations
│   │   ├── simulationEngine.ts # Carbon Twin + Forecast engine
│   │   ├── storage.ts          # localStorage persistence layer
│   │   ├── gemini.ts           # Gemini AI integration + rate limiter
│   │   └── utils.ts            # Shared utility functions
│   │
│   ├── store/
│   │   └── useAppStore.ts      # Zustand global state
│   │
│   └── tests/
│       └── unit/               # Jest unit tests
│
├── tests/
│   └── e2e/                    # Playwright E2E tests
│
├── Dockerfile                  # Multi-stage Docker build
├── .dockerignore
├── cloudbuild.yaml             # Google Cloud Build CI/CD
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- A free [Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/Soniya2001/Carbon-Awareness-Platform.git
cd Carbon-Awareness-Platform
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your Gemini API key:
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

> The API key can also be entered directly in the app's **Settings** page — it will be stored securely in localStorage.

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Optional at build time | Google Gemini API key. Can also be set in app Settings. |

That's it. **One environment variable** is all you need.

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage

# Watch mode
npx jest --watch
```

**Coverage targets:** 90%+ for core logic modules

| Module | Tests |
|--------|-------|
| `carbonEngine.ts` | calcCO2, carbonScore, sustainability score, equivalents |
| `simulationEngine.ts` | runSimulation, forecastFromHistory, communityImpact |
| `storage.ts` | CRUD, gamification, streaks, badges, challenges |
| `gamification.test.ts` | Level thresholds, badge requirements |

### E2E Tests (Playwright)

```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npx playwright test --ui
```

| Spec | Scenarios |
|------|-----------|
| `calculator.spec.ts` | Log activity, live preview, validation |
| `carbon-twin.spec.ts` | Select scenario, run simulation, save |

---

## 🐳 Docker

### Build locally

```bash
docker build \
  --build-arg NEXT_PUBLIC_GEMINI_API_KEY=your_key \
  -t carbonwise-ai:latest .
```

### Run container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_GEMINI_API_KEY=your_key \
  carbonwise-ai:latest
```

---

## ☁️ Google Cloud Run Deployment

### Prerequisites

```bash
# Install Google Cloud CLI
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Store API key in Secret Manager

```bash
echo -n "your_gemini_api_key" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-
```

### Create Artifact Registry repository

```bash
gcloud artifacts repositories create carbonwise \
  --repository-format=docker \
  --location=us-central1
```

### Deploy manually

```bash
# Build & push
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE_NAME=carbonwise-ai

# Or deploy directly
gcloud run deploy carbonwise-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=NEXT_PUBLIC_GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --min-instances=0 \
  --max-instances=10
```

### CI/CD with Cloud Build trigger

```bash
# Connect your GitHub repo and create trigger
gcloud builds triggers create github \
  --repo-name=Carbon-Awareness-Platform \
  --repo-owner=Soniya2001 \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## ♿ Accessibility Report (WCAG 2.1 AA)

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **1.1.1** Non-text Content | ✅ Pass | All icons have `aria-hidden`, charts have `role="img"` + `aria-label` |
| **1.3.1** Info and Relationships | ✅ Pass | Semantic HTML: `<nav>`, `<main>`, `<aside>`, heading hierarchy |
| **1.4.3** Contrast (Minimum) | ✅ Pass | All text meets 4.5:1 ratio; eco-600 on white = 5.2:1 |
| **1.4.11** Non-text Contrast | ✅ Pass | UI components meet 3:1 against adjacent colours |
| **2.1.1** Keyboard | ✅ Pass | All interactive elements keyboard accessible; Radix UI primitives |
| **2.1.2** No Keyboard Trap | ✅ Pass | Dialog/Modal dismiss with Escape; focus returned to trigger |
| **2.4.3** Focus Order | ✅ Pass | Logical DOM order; skip link to `#main-content` |
| **2.4.7** Focus Visible | ✅ Pass | `focus-visible:ring-2` on all interactive elements |
| **3.1.1** Language of Page | ✅ Pass | `<html lang="en">` set |
| **3.3.1** Error Identification | ✅ Pass | `role="alert"` on form errors; `aria-describedby` on inputs |
| **3.3.2** Labels or Instructions | ✅ Pass | All form controls have associated `<label>` |
| **4.1.2** Name, Role, Value | ✅ Pass | ARIA labels on all custom controls |
| **4.1.3** Status Messages | ✅ Pass | `aria-live="polite"` on CO2 preview, success messages |

> ⚠️ Full validation requires manual testing with assistive technologies (NVDA, VoiceOver, JAWS).

---

## 🔒 Security Report

| Threat | Mitigation |
|--------|-----------|
| **XSS** | All user inputs sanitized via `sanitize()` in `utils.ts`; React's default JSX escaping |
| **API Key exposure** | Key stored in localStorage; never sent to any 3rd party except Google APIs |
| **CSP** | Strict Content-Security-Policy in `next.config.ts` `headers()` |
| **Clickjacking** | `X-Frame-Options: DENY` header |
| **MIME sniffing** | `X-Content-Type-Options: nosniff` header |
| **Gemini prompt injection** | Inputs trimmed and length-limited (`sanitize()` max 10,000 chars) before AI calls |
| **Rate limiting** | Client-side rate limiter in `gemini.ts`: max 10 calls/min |
| **Secrets** | API key never committed; `.env` in `.gitignore`; Cloud Run uses Secret Manager |
| **Dependencies** | Pinned versions in `package.json`; regular `npm audit` |

---

## 🚀 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Lighthouse Performance | 95+ | `next/dynamic` for heavy components, standalone output |
| LCP | < 2.5s | Static rendering for all pages; optimized fonts |
| CLS | < 0.1 | Skeleton loaders for async content |
| FID | < 100ms | React 18 concurrent features; no blocking JS |
| Bundle size | < 200kb initial | Code splitting, tree shaking, dynamic imports |

---

## 📊 Application Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Carbon Calculator | 50+ emission factors across 5 categories |
| 2 | AI Sustainability Coach | Gemini-powered chat, explanations, recommendations |
| 3 | Carbon Twin AI | Simulate 6 lifestyle scenarios over 1–10 years |
| 4 | Forecast Engine | Linear regression + seasonality, confidence score |
| 5 | AI Challenge Generator | Gemini-generated personalised eco missions |
| 6 | Gamification | 5 levels, 9 badges, daily streaks, eco points |
| 7 | Community Simulator | Impact visualisation at 1K–1M scale |
| 8 | Analytics Dashboard | Pie, Line, Bar, Area charts + KPI cards |
| 9 | Accessibility | WCAG 2.1 AA, ARIA, keyboard nav |
| 10 | Security | CSP, XSS protection, input sanitisation |
| 11 | Performance | Lighthouse 95+, lazy loading, memoization |
| 12 | Testing | Jest unit tests + Playwright E2E |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 (strict mode) |
| Styling | Tailwind CSS 3.4 |
| Components | ShadCN UI (Radix primitives) |
| Animations | Framer Motion 11 |
| Charts | Recharts 2.14 |
| State | Zustand 5 |
| Forms | React Hook Form + Zod |
| AI | Google Gemini 1.5 Flash |
| Persistence | Browser localStorage |
| Testing | Jest + React Testing Library + Playwright |
| Deployment | Google Cloud Run |
| CI/CD | Google Cloud Build |

---

## 📝 Data Model (localStorage)

```typescript
cw_records       → ActivityRecord[]     // Carbon activity log
cw_prefs         → UserPreferences      // Name, diet, API key, theme
cw_gamification  → GamificationState   // Points, level, streak, badges
cw_challenges    → StoredChallenge[]    // Active + completed challenges
cw_simulations   → StoredSimulation[]  // Carbon Twin history
cw_chat          → ChatMessage[]        // AI Coach conversation
```

---

## 🌱 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2025 CarbonWise AI

---

<div align="center">
  <p>Built with 💚 for a sustainable future</p>
  <p><em>No sign-up. No database. No backend. Just you, Gemini AI, and your browser.</em></p>
</div>
