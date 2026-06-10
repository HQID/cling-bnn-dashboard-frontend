# BNN Dashboard

Web dashboard for BNN (Badan Narkotika Nasional) team members to manage rehabilitation program clients.

## Features

- **Admin Authentication**: Firebase Auth with custom claims for role-based access
- **Dashboard Overview**: Aggregate stats, phase distribution, streak distribution
- **Client Management**: Create, view, update, deactivate BNN clients
- **Program Builder**: Create and edit recovery programs with phases, tasks, critical days, and games
- **Progress Analytics**: Quest history, relapse logs, emergency events
- **Admin Management**: Super admins can create and manage other admins

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Auth**: Firebase Authentication
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication enabled
- Backend API running (see `cling-backend`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your Firebase configuration in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Navigate to `/setup`
2. Enter the setup secret (from `BNN_SETUP_SECRET` env var in backend)
3. Create the first super admin account
4. Sign in at `/login`

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── dashboard/        # Overview page
│   │   ├── clients/          # Client list & detail
│   │   │   └── [uid]/        # Client detail & program builder
│   │   └── settings/         # Admin settings
│   ├── login/                # Login page
│   ├── setup/                # First-time admin setup
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Root redirect
│   └── providers.tsx         # React Query & Auth providers
├── components/
│   ├── auth-guard.tsx        # Protected route wrapper
│   └── sidebar.tsx           # Navigation sidebar
├── contexts/
│   └── auth-context.tsx      # Firebase Auth context
├── hooks/
│   └── use-api.ts            # TanStack Query hooks
└── lib/
    ├── api.ts                # Axios instance & types
    ├── firebase.ts           # Firebase configuration
    └── utils.ts              # Utility functions
```

## API Integration

The dashboard connects to the same backend as the mobile app. All API calls are prefixed with `/v1/bnn/`.

### Authentication

All API calls include a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

| Group | Endpoint | Purpose |
|-------|----------|---------|
| Admin | `POST /v1/bnn/admin/setup-first-admin` | First-time setup |
| Admin | `POST /v1/bnn/admin/create-admin` | Create admin (super admin only) |
| Admin | `GET /v1/bnn/admin/me` | Get current admin profile |
| Admin | `GET /v1/bnn/admin/list` | List all admins |
| Clients | `POST /v1/bnn/clients/create` | Create client account |
| Clients | `GET /v1/bnn/clients/list` | List clients |
| Clients | `GET /v1/bnn/clients/:id` | Get client details |
| Clients | `PATCH /v1/bnn/clients/:id` | Update client |
| Clients | `DELETE /v1/bnn/clients/:id` | Deactivate client |
| Clients | `POST /v1/bnn/clients/:id/reset-password` | Reset password |
| Programs | `POST /v1/bnn/programs/clients/:id/program` | Create/replace program |
| Programs | `GET /v1/bnn/programs/clients/:id/program` | Get program |
| Analytics | `GET /v1/bnn/analytics/dashboard/overview` | Dashboard stats |
| Analytics | `GET /v1/bnn/analytics/clients/:id/quests` | Quest history |
| Analytics | `GET /v1/bnn/analytics/clients/:id/relapse-logs` | Relapse history |
| Analytics | `GET /v1/bnn/analytics/clients/:id/emergency-logs` | Emergency events |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3000/v1`) |

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

## License

Internal use only - BNN Rehabilitation Program
