# RepoMedic 🩺

RepoMedic is an AI-assisted system designed to bridge the gap between Jira bug tickets and code fixes. It automatically analyzes incoming Jira webhooks, retrieves relevant code context from your repository using RAG (Retrieval-Augmented Generation), and suggests minimal, scoped code changes for developers to review.

## 🚀 Key Features

- **Jira Integration:** Automatically processes bug tickets via webhooks.
- **Context-Aware Suggestions:** Uses RAG to find the most relevant source files for a reported bug.
- **Developer-Centric:** Provides suggested diffs for manual review, keeping the human in the loop.
- **Git-Aware:** Indexes only git-tracked files to ensure accuracy.

## 🛠 Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** PostgreSQL with Prisma ORM.
- **AI/LLM:** Provider-agnostic (Gemini, Codex, etc.).
- **Infrastructure:** GitHub Actions for CI.

## 📋 Prerequisites

- Node.js (v20+)
- PostgreSQL instance
- Jira project with Webhook access

## ⚙️ Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file with `DATABASE_URL`, `PORT`, and other required variables.
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing & CI

The project uses GitHub Actions to ensure code quality.
- **Backend CI:** Runs on every push/PR to `main`, performing type checks, Prisma validation, and builds.

## 📄 License

This project is licensed under the ISC License.
