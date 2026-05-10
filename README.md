# 🌍 Traveloop – AI-Powered Travel Planning Platform

> An intelligent multi-city travel planning platform where users can plan trips, build itineraries, discover cities, add activities, track budgets, manage packing, share trips, generate AI suggestions, and maintain travel journals.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM (v5) |
| Auth | JWT + Refresh Tokens + Google OAuth |
| AI | Google Gemini 1.5 Flash |
| State | Zustand (frontend) |

---

## 📁 Project Structure

```
traveloop/
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Auth, rate-limit, error handling
│   │   ├── lib/           # Prisma client, logger
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma  # Full DB schema
│   │   └── seed.ts        # Demo data seeder
│   └── .env.example
│
└── frontend/         # Next.js app
    ├── src/
    │   ├── app/           # Next.js App Router pages
    │   │   ├── dashboard/ # Dashboard layout + pages
    │   │   ├── trips/     # Trip CRUD
    │   │   ├── ai/        # AI chatbot
    │   │   ├── budget/    # Budget analytics
    │   │   ├── packing/   # Packing checklist
    │   │   ├── journal/   # Travel journal
    │   │   ├── cities/    # City discovery
    │   │   ├── share/     # Public trip sharing
    │   │   └── profile/   # User profile
    │   ├── services/      # API client methods
    │   ├── store/         # Zustand auth store
    │   ├── types/         # TypeScript interfaces
    │   └── lib/           # Axios client, utilities
    └── .env.example
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb traveloop

# Or via psql
psql -U postgres -c "CREATE DATABASE traveloop;"
```

### 2. Backend Setup

```bash
cd backend

# Copy and configure env
cp .env.example .env
# Edit .env with your DATABASE_URL and other keys

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npm run prisma:seed

# Start dev server (port 5000)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Copy and configure env
cp .env.example .env.local
# Edit with your API URL

# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

### 4. Open the app
Navigate to **http://localhost:3000**

Demo credentials (after seeding):
- **Email**: `admin@traveloop.com` / **Password**: `Admin@123`
- **Email**: `demo@traveloop.com` / **Password**: `Demo@123`

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | ⚪ | For Google OAuth |
| `UNSPLASH_ACCESS_KEY` | ⚪ | For city images |
| `OPENWEATHER_API_KEY` | ⚪ | For weather data |
| `GEODB_API_KEY` | ⚪ | For city search |
| `EMAIL_*` | ⚪ | For email verification |

### Frontend (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ⚪ | For Google OAuth UI |

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout
- `POST /api/auth/google` — Google OAuth
- `POST /api/auth/forgot-password` — Send reset email
- `POST /api/auth/reset-password` — Reset password

### Trips
- `GET /api/trips` — List user trips (search, filter, paginate)
- `POST /api/trips` — Create trip
- `GET /api/trips/:id` — Get trip by ID
- `PUT /api/trips/:id` — Update trip
- `DELETE /api/trips/:id` — Delete trip
- `POST /api/trips/:id/duplicate` — Duplicate trip

### AI
- `POST /api/ai/itinerary` — Generate AI itinerary
- `POST /api/ai/chat` — AI travel chatbot
- `POST /api/ai/budget` — AI budget estimator
- `POST /api/ai/packing` — AI packing list
- `POST /api/ai/insights` — City/destination insights

### Other endpoints: destinations, activities, budgets, packing, notes, share, cities, weather, profile, admin

---

## 🎨 Features

- ✅ AI trip planning (Google Gemini)
- ✅ Multi-city itinerary builder
- ✅ Budget analytics with charts
- ✅ Smart packing checklist (AI-generated)
- ✅ Travel journal with mood tracking
- ✅ Public trip sharing with likes
- ✅ City discovery with AI insights
- ✅ JWT auth + refresh tokens
- ✅ Google OAuth ready
- ✅ Mobile responsive
- ✅ Glassmorphism dark UI
- ✅ Framer Motion animations

---

## 📜 License
MIT © Traveloop 2025
