# Merged 3D Studio

A full-stack 3D design studio with AI-powered website generation capabilities.

## Project Structure

```
merged-3d-studio/
├── client/                    # Vite + React 19 frontend (from 3D-Design-Studio)
│   ├── src/
│   │   ├── components/        # React components (Navbar, Builder, HeroSection, etc.)
│   │   ├── assets/            # Static assets
│   │   ├── lib/               # Utility libraries
│   │   └── utils/             # Helper utilities
│   ├── public/                # Public assets
│   └── package.json
├── server/                    # Express + MongoDB backend
│   ├── core/                  # AI pipeline modules
│   │   ├── AIArchitect.js             # Prompt analysis & intent extraction
│   │   ├── BlueprintGenerator.js       # Blueprint generation (AI + local fallback)
│   │   ├── AgentWebsiteOrchestrator.js # Multi-agent website pipeline
│   │   ├── CodeGenerator.js            # React + Three.js code generation
│   │   ├── MasterLayoutEngine.js       # Layout archetype code generation (A-J)
│   │   └── WebsiteBlueprintEngine.js   # Website blueprint generation
│   ├── lib/                   # AI client utilities
│   │   ├── ai-clients.js      # Anthropic, Google AI, Groq, Supabase clients
│   │   └── blueprint-helpers.js # Industry classification, palettes, layouts
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Design.js
│   │   ├── Project.js
│   │   └── Contact.js
│   ├── routes/                # Express route handlers
│   │   ├── auth.js            # Authentication (signup, login, me)
│   │   ├── designs.js         # Design CRUD
│   │   ├── projects.js        # Project CRUD
│   │   ├── contactRoutes.js   # Contact form
│   │   └── ai.js              # AI endpoints
│   ├── templates/             # Blueprint schema & samples
│   ├── tests/                 # Unit & property tests
│   └── package.json
├── .env.example               # Environment variables reference
├── package.json               # Root scripts (concurrently)
└── README.md                  # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Environment Variables

Copy the example env files:

```bash
cp .env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your configuration:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `EMAIL_USER` | Email for contact form | For contact |
| `EMAIL_PASS` | Email app password | For contact |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `ANTHROPIC_API_KEY` | Claude API key | For AI features |
| `GOOGLE_PROJECT_ID` | GCP project ID | For AI features |
| `GOOGLE_LOCATION` | GCP location (e.g., us-central1) | For AI features |
| `GROQ_API_KEY` | Groq API key | For AI features |
| `MESHY_API_KEY` | Meshy 3D API key | For 3D generation |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Optional (credits) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Optional (credits) |

### 3. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev

# Or start individually:
npm run dev:client   # Frontend at http://localhost:5173
npm run dev:server   # Backend at http://localhost:5000
```

## API Endpoints

### Original Routes (from 3D-Design-Studio)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (auth) |
| GET | `/api/designs/:userId` | Get user designs |
| POST | `/api/designs` | Save design |
| DELETE | `/api/designs/:id` | Delete design |
| CRUD | `/api/projects` | Project management (auth) |
| POST | `/api/contact` | Submit contact message |

### AI Routes (from AI Pipeline)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/health` | Health check |
| GET | `/api/ai/check-credits` | Check user credits |
| POST | `/api/ai/generate-blueprint` | Generate website blueprint |
| POST | `/api/ai/generate-agentic-website` | Full agentic pipeline |
| POST | `/api/ai/generate-code` | Generate code from blueprint |
| POST | `/api/ai/generate-3d-model` | Generate 3D model (Meshy) |

## Running Tests

```bash
cd server && npm test
```

Tests include:
- Unit tests for route registration
- Unit tests for AI package dependencies
- Path alias verification
- API endpoint integration tests
- Property-based tests for AI generation routes
- Property-based tests for credit resolution

## Tech Stack

### Frontend
- **Framework**: React 19, Vite 8
- **Styling**: Tailwind CSS 4, Framer Motion
- **3D**: React Three Fiber, Three.js, @react-three/drei
- **UI**: Radix UI, shadcn, Lucide React

### Backend
- **Runtime**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Auth**: JWT with bcryptjs
- **Email**: Nodemailer

### AI Pipeline
- **Claude** (Anthropic) - Primary AI generation
- **Gemini** (Google AI) - Secondary AI generation
- **Groq** - Fallback AI generation
- **Supabase** - Credit management (optional)

## Credits

This project merges two original projects:

1. **3D-Design-Studio** — Vite + React 19 frontend with Express/MongoDB backend for 3D design customization
2. **3d-web-main** — Next.js 14 AI pipeline for automated website generation with multi-agent orchestration

## License

MIT
"# 3d-webproject" 
