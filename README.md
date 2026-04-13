# EduSense AI – Adaptive Learning Platform

## Project Summary

EduSense AI is an intelligent, adaptive learning and assessment platform designed to personalize education using AI-driven insights. Unlike traditional one-size-fits-all systems, EduSense dynamically adapts learning content, difficulty levels, and feedback based on individual learner performance, engagement, and progress.

The platform aims to improve learning outcomes by identifying strengths and weaknesses in real-time and providing personalized recommendations, making education more effective, inclusive, and data-driven.


## ⚙️ Setup and Run Instructions

### Prerequisites

Make sure you have the following installed:

* **Node.js** (v18 or later recommended)
* **npm** or **pnpm**
* **Git**

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/devDhrubo/EduSense-AI-Adaptive-Learning-Platform.git
cd EduSense-AI-Adaptive-Learning-Platform
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Environment setup**
   Create a `.env.local` file in the root directory and add required API keys:

```env
VITE_AI_API_KEY=your_api_key_here
```

4. **Run the development server**

```bash
npm run dev
# or
pnpm dev
```

5. **Open in browser**

```text
http://localhost:5173
```

---

## 🧰 Tech Stack and Dependencies

### Frontend

* **React** (with TypeScript)
* **Vite** (fast build tool)
* **Tailwind CSS** (UI styling)

### AI & Logic

* Adaptive learning logic
* Performance-based assessment flow
* Real-time feedback generation

### Tools & Libraries

* Node.js
* npm / pnpm
* ESLint
* PostCSS

---

## 🏗 Architecture Overview

The project follows a **modular and scalable architecture**:

```text
src/
├── components/      # Reusable UI components
├── services/        # API calls and AI logic
├── types/           # TypeScript interfaces and models
├── pages/           # Application pages
├── App.tsx          # Root application component
├── main.tsx         # Entry point
└── styles/          # Global styles
```

### Architecture Flow

1. User interacts with the UI
2. Data is sent to adaptive logic services
3. AI logic analyses performance
4. Personalised content and feedback are generated
5. UI updates dynamically based on results

This separation ensures maintainability, scalability, and clean code structure.

---

## 📜 License

This project is licensed under the **MIT License**.

Create a `LICENSE` file in the root directory and add:

```text
MIT License

Copyright (c) 2025 EduSense AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🌐 Live Demo

🔗 [https://edusense-ai.vercel.app](https://edusense-ai.vercel.app)

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome.
Feel free to fork the repository and submit a pull request.


