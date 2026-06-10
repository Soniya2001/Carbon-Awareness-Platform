# 🌱 CarbonWise AI – Your Personal Sustainability Coach

CarbonWise AI is a full-stack, production-ready carbon footprint tracking and reduction platform powered by Gemini AI. It features real-time carbon calculation, AI-powered coaching, predictive forecasting, gamification, and a Carbon Twin simulation engine.

---

## ✨ Features

- **Carbon Footprint Tracker** – Log daily activities across Transportation, Energy, Food, Shopping & Waste with real-time CO₂e calculations
- **AI Coach (Gemini AI)** – Conversational AI coach that analyzes your footprint and delivers personalized reduction strategies
- **Carbon Twin Simulator** – Project your emissions 1, 3, and 5 years under multiple lifestyle scenarios
- **Predictive Forecasting** – ML-inspired trend analysis with confidence intervals
- **Gamification** – Eco points, badges, streaks, and leaderboards
- **Community Dashboard** – Anonymous aggregate impact stats
- **Admin Panel** – User management, analytics, challenge creation
- **Full Auth** – JWT + Google OAuth with refresh token rotation

---

## 🏗️ Architecture

```
Carbon-Awareness-Platform/
├── frontend/          # Next.js 15 + Tailwind + ShadCN + Zustand
├── backend/           # Express + Prisma + PostgreSQL + Redis
├── docker-compose.yml # Development orchestration
└── .github/workflows/ # CI/CD pipelines
```

### Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 15, React 18, TypeScript        |
| Styling    | Tailwind CSS, ShadCN UI, Framer Motion  |
| State      | Zustand                                 |
| Backend    | Node.js, Express, TypeScript            |
| Database   | PostgreSQL 16 via Prisma ORM            |
| Cache      | Redis 7                                 |
| AI         | Google Gemini AI                        |
| Auth       | JWT + Refresh Tokens + Google OAuth     |
| Charts     | Recharts                                |
| Testing    | Jest, React Testing Library, Cypress    |
| CI/CD      | GitHub Actions → Google Cloud Run       |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Google Gemini API Key
- Google OAuth Credentials (optional)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/carbon-awareness-platform.git
cd Carbon-Awareness-Platform
npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

### 3. Start with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, backend (port 4000) and frontend (port 3000).

### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/health

---

## 🛠️ Development

### Run Without Docker

```bash
# Terminal 1 – Backend
cd backend
npm install
npm run dev

# Terminal 2 – Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |

#### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |
| `NEXTAUTH_URL` | NextAuth callback URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional |

---

## 🧪 Testing

```bash
# Backend unit + integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

---

## 🐳 Docker

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Rebuild after changes
docker-compose build --no-cache
```

---

## 📦 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Carbon
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/carbon/record` | Log carbon activity |
| GET | `/api/carbon/history` | Get activity history |
| GET | `/api/carbon/summary` | Get footprint summary |
| GET | `/api/carbon/categories` | Get emission categories |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/explain` | Explain footprint |
| POST | `/api/ai/recommend` | Get recommendations |
| POST | `/api/ai/chat` | Chat with AI coach |
| POST | `/api/ai/challenge` | Generate AI challenge |

### Simulation
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/simulation/run` | Run Carbon Twin simulation |
| GET | `/api/simulation/history` | Get simulation history |
| GET | `/api/simulation/:id` | Get simulation by ID |

---

## 🚀 Deployment (Google Cloud Run)

The GitHub Actions CD pipeline automatically deploys on push to `main`:

1. Builds Docker images
2. Pushes to Google Container Registry
3. Deploys frontend to Cloud Run
4. Deploys backend to Cloud Run

Set these GitHub Secrets:
- `GCP_PROJECT_ID`
- `GCP_SA_KEY` (Service Account JSON)
- All environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

## 🌍 Impact

Every kilogram of CO₂ you track and reduce matters. Together, CarbonWise users have:
- Tracked millions of activities
- Reduced thousands of tonnes of CO₂e
- Planted the equivalent of tens of thousands of trees

*Start your sustainability journey today.*
