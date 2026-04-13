@echo off
REM ============================================
REM EduSense AI - Professional Git Commit Script
REM Run this from the project root directory
REM ============================================

echo.
echo ========================================
echo  EduSense AI - Smart Git Commit Script
echo ========================================
echo.

REM --- 1. Project Configuration ---
git add package.json tsconfig.json vite.config.ts .gitignore .env.example
git commit -m "chore: configure project with Vite, TypeScript, and environment setup"

REM --- 2. HTML Entry Point & Global Styles ---
git add index.html index.css
git commit -m "feat: add HTML entry point with Tailwind config and global CSS reset"

REM --- 3. React Bootstrap ---
git add index.tsx
git commit -m "feat: add React 19 application bootstrap with StrictMode"

REM --- 4. Type Definitions ---
git add types.ts types.voice.ts
git commit -m "feat: define TypeScript interfaces for users, assessments, classrooms, and voice"

REM --- 5. Mock Data ---
git add data.ts
git commit -m "feat: add comprehensive mock data for students, teachers, and assessments"

REM --- 6. Core UI Components ---
git add components/Button.tsx components/Card.tsx components/Modal.tsx components/ProgressBar.tsx components/RadialProgressBar.tsx components/Confetti.tsx components/icons.tsx
git commit -m "feat(ui): add reusable UI primitives - Button, Card, Modal, ProgressBar, icons"

REM --- 7. Layout Components ---
git add components/Header.tsx components/Sidebar.tsx components/Footer.tsx components/OnboardingTour.tsx components/PermissionModal.tsx
git commit -m "feat(layout): add Header with notifications, Sidebar navigation, and Footer"

REM --- 8. Authentication & Landing ---
git add components/LoginView.tsx components/AcademicLevelSelectionView.tsx components/UserProfileView.tsx
git commit -m "feat(auth): add landing page, role selection, login/signup forms, and user profile"

REM --- 9. Student Dashboard ---
git add components/DashboardView.tsx components/Heatmap.tsx components/RecommendationCard.tsx
git commit -m "feat(dashboard): add student dashboard with stats, heatmap, and AI recommendations"

REM --- 10. Assessment System ---
git add components/AssessmentView.tsx components/AssessmentDetailView.tsx components/AssessmentEditorView.tsx components/AdaptiveQuizView.tsx components/InteractiveQuiz.tsx components/ResultsView.tsx
git commit -m "feat(assessment): add quiz engine with adaptive difficulty and detailed results"

REM --- 11. Analytics & Visualization ---
git add components/SkillRadarView.tsx components/SkillTreeView.tsx components/KnowledgeGraphView.tsx components/ProgressTimelineView.tsx components/StudentProfileView.tsx
git commit -m "feat(analytics): add skill radar, knowledge graph (D3), and progress timeline"

REM --- 12. Learning Features ---
git add components/DynamicLearningPathView.tsx components/PersonalizedLearningPathView.tsx components/RealLifeAppContextView.tsx components/IQTestView.tsx
git commit -m "feat(learning): add dynamic learning paths, real-life contexts, and IQ assessment"

REM --- 13. AI Features ---
git add components/AIGeneratorView.tsx components/AITutor.tsx components/EmotionAwareLearning.tsx
git commit -m "feat(ai): add AI tutor (Sparky), content generator, and emotion-aware learning"

REM --- 14. Voice Assistant ---
git add components/VoiceBasedLearningAssistant.tsx components/VoiceBasedLearningAssistant.examples.tsx
git commit -m "feat(voice): add voice-based learning assistant with speech recognition"

REM --- 15. Teacher Features ---
git add components/TeacherDashboardView.tsx components/TeacherFeedbackModal.tsx components/SmartClassInsightView.tsx components/StudentDetailView.tsx
git commit -m "feat(teacher): add teacher dashboard, student analytics, and smart class insights"

REM --- 16. Classroom System ---
git add components/MyClassroomsListView.tsx components/StudentClassroomView.tsx
git commit -m "feat(classroom): add classroom list, join system, and student classroom view"

REM --- 17. Gamification ---
git add components/RewardStoreView.tsx
git commit -m "feat(gamification): add XP reward store with AI-powered learning rewards"

REM --- 18. Frontend Services ---
git add services/aiService.ts services/voiceService.ts services/dataService.ts services/api.ts
git commit -m "feat(services): add AI service, voice service, data service, and backend API client"

REM --- 19. Advanced AI Services ---
git add services/adaptiveContentEngine.ts services/bayesianKnowledgeTracing.ts services/performancePredictionModel.ts services/reinforcementLearningEngine.ts services/multiAgentController.ts services/userProfilingService.ts services/teacherCoPilotService.ts
git commit -m "feat(ai-engine): add adaptive content, Bayesian tracing, and RL learning engine"

REM --- 20. AI System Utilities ---
git add services/aiSystemsIntegration.ts services/aiSystemsExamples.ts services/integrationTests.ts services/AI_QUICK_START.ts
git commit -m "feat(ai-utils): add AI systems integration layer and quick-start examples"

REM --- 21. Main App Component ---
git add App.tsx
git commit -m "feat(app): add main App component with routing, state management, and view orchestration"

REM --- 22. Public Assets ---
git add public/
git commit -m "feat(assets): add public assets and hero image"

REM --- 23. Backend - Server Configuration ---
git add server/package.json server/tsconfig.json server/.env.example
git commit -m "feat(backend): configure Express server with TypeScript, Prisma, and JWT auth"

REM --- 24. Backend - Database Schema ---
git add server/prisma/schema.prisma server/prisma/seed.ts
git commit -m "feat(database): add PostgreSQL schema with 8 models and demo data seeder"

REM --- 25. Backend - Middleware ---
git add server/src/middleware/auth.middleware.ts server/src/middleware/error.middleware.ts server/src/middleware/validate.middleware.ts
git commit -m "feat(middleware): add JWT authentication, error handling, and Zod validation"

REM --- 26. Backend - Prisma Client & Validators ---
git add server/src/lib/prisma.ts server/src/validators/schemas.ts
git commit -m "feat(backend): add Prisma client singleton and Zod validation schemas"

REM --- 27. Backend - Auth & User API ---
git add server/src/controllers/auth.controller.ts server/src/routes/auth.routes.ts server/src/controllers/user.controller.ts server/src/routes/user.routes.ts
git commit -m "feat(api): add authentication endpoints (register, login, profile) and user management"

REM --- 28. Backend - Classroom & Assessment API ---
git add server/src/controllers/classroom.controller.ts server/src/routes/classroom.routes.ts server/src/controllers/assessment.controller.ts server/src/routes/assessment.routes.ts
git commit -m "feat(api): add classroom CRUD, join system, and assessment management endpoints"

REM --- 29. Backend - Submission & AI API ---
git add server/src/controllers/submission.controller.ts server/src/routes/submission.routes.ts server/src/controllers/ai.controller.ts server/src/routes/ai.routes.ts
git commit -m "feat(api): add submission tracking with XP system and AI proxy endpoints"

REM --- 30. Backend - Server Entry Point ---
git add server/src/index.ts
git commit -m "feat(server): add Express server entry point with security middleware and route mounting"

REM --- 31. Deployment & Documentation ---
git add vercel.json LICENSE README.md
git commit -m "docs: add README with full-stack setup guide, Vercel config, and MIT license"

REM --- 32. Any remaining files ---
git add -A
git diff --cached --quiet || git commit -m "chore: add remaining project files"

echo.
echo ========================================
echo  All commits created successfully!
echo  Now run: git push origin main
echo ========================================
echo.
