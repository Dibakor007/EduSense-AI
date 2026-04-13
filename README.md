# EduSense AI — Adaptive Learning Platform

An intelligent, AI-powered adaptive learning and assessment platform that personalizes education using real-time analytics, Gemini AI integration, and dynamic content generation.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-purple?logo=prisma)
![Vite](https://img.shields.io/badge/Vite-6-yellow?logo=vite)

## 🌐 Live Demo

🔗 [https://edusense-ai.vercel.app](https://edusense-ai.vercel.app)

---

## ✨ Key Features

### 🎓 Student Experience
- **AI-Powered Adaptive Assessments** — Gemini AI generates personalized quizzes based on subject, topic, and academic level
- **Dynamic Learning Paths** — Personalized learning recommendations based on skill gaps
- **Knowledge Graph Visualization** — Interactive D3.js-powered skill mastery maps
- **Skill Radar & Progress Timeline** — Track learning progress over time with rich analytics
- **AI Tutor (Sparky)** — Real-time conversational AI tutor for learning support
- **Voice-Based Learning Assistant** — Hands-free learning with speech recognition
- **Emotion-Aware Learning** — Adapts content based on detected learning emotions
- **Gamification** — XP, levels, streaks, and a reward store to boost engagement
- **IQ Assessment** — Adaptive IQ-style test with dynamic difficulty

### 👩‍🏫 Teacher Experience
- **Smart Classroom Management** — Create classrooms, invite students via class codes
- **AI-Generated Assessments** — Generate complete assessments with one click
- **Student Analytics Dashboard** — Deep insights into individual student performance
- **Smart Class Insights** — AI-powered analysis of class-wide performance patterns
- **Teacher Feedback System** — Grade submissions and provide personalized feedback
- **Real-time Notifications** — Stay updated on student activity

---

## 🏗️ Architecture

```
EduSense-AI/
├── index.html                # Frontend entry point
├── index.tsx                 # React bootstrap
├── App.tsx                   # Main application component (routing, state)
├── vite.config.ts            # Vite build configuration
├── vercel.json               # Vercel deployment config
│
├── components/               # 45+ React components
│   ├── LoginView.tsx         # Landing page, role selection, auth forms
│   ├── DashboardView.tsx     # Student dashboard
│   ├── TeacherDashboardView.tsx  # Teacher dashboard
│   ├── AITutor.tsx           # Conversational AI tutor
│   ├── AssessmentView.tsx    # Quiz-taking interface
│   ├── KnowledgeGraphView.tsx    # D3 knowledge graph
│   └── ...
│
├── services/                 # Business logic & API clients
│   ├── api.ts                # Backend API client (auth, CRUD, AI proxy)
│   ├── aiService.ts          # Gemini AI integration
│   ├── voiceService.ts       # Web Speech API service
│   └── ...
│
├── server/                   # Express.js Backend
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── controllers/      # Route handlers (auth, classroom, assessment, AI)
│   │   ├── routes/           # Express route definitions
│   │   ├── middleware/       # Auth (JWT), validation (Zod), error handling
│   │   ├── lib/              # Prisma client singleton
│   │   └── validators/       # Zod validation schemas
│   └── prisma/
│       ├── schema.prisma     # Database schema (8 models)
│       └── seed.ts           # Demo data seeder
│
├── types.ts                  # TypeScript type definitions
└── data.ts                   # Mock/demo data
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node.js)
- **PostgreSQL** (local or cloud — [Neon](https://neon.tech) recommended for free cloud DB)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Dibakor007/EduSense-AI.git
cd EduSense-AI
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your Gemini API key
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
# Edit server/.env with your database URL and API keys

# Generate Prisma client
npx prisma generate

# Push database schema (creates tables)
npx prisma db push

# Seed demo data (optional)
npm run seed

# Go back to root
cd ..
```

### 4. Run the Application

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend (from root)
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### 5. Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | rahul.sharma@example.com | password123 |
| Teacher | priya.singh@example.com | password123 |

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework |
| Vite 6 | Build tool & dev server |
| Tailwind CSS (CDN) | Styling |
| Recharts | Data visualization charts |
| D3.js | Knowledge graph & force layouts |
| Web Speech API | Voice-based learning |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Prisma ORM | Database access |
| PostgreSQL | Relational database |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet + CORS | Security middleware |

### AI
| Technology | Purpose |
|-----------|---------|
| Google Gemini 2.0 Flash | Quiz generation, tutoring, recommendations |

---

## 🔧 Environment Variables

### Frontend (`.env`)
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=/api          # Optional: override for production backend URL
```

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/edusense?schema=public"
JWT_SECRET="your_strong_jwt_secret_here"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your_gemini_api_key"
FRONTEND_URL="http://localhost:3000"
```

---

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the following:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel dashboard:
   - `VITE_GEMINI_API_KEY`
   - `VITE_API_BASE_URL` (your backend URL, e.g., `https://your-backend.railway.app/api`)

### Backend (Railway / Render)

1. Create a new project on [Railway](https://railway.app) or [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `server/`
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm start`
5. Add all `server/.env` variables in the platform's environment settings
6. Add a PostgreSQL addon or connect your Neon database URL

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork the repository and submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
