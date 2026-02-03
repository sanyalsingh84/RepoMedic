# Project Context: AI Bug Ticket → Code Suggestion System

## Objective

Build a MERN-based AI system where Jira bug tickets are converted into
context-aware code fix suggestions using Retrieval-Augmented Generation (RAG).

The system MUST:

- Assist developers, not auto-fix code
- Keep humans in the review loop
- Generate minimal, scoped changes only

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- AI: Gemini (via Gemini CLI)
- Integration: Jira Webhooks
- Repo Hosting: GitHub

## Core Workflow

1. Jira webhook receives bug ticket
2. Ticket is normalized into structured JSON
3. Relevant source files are retrieved using vector similarity
4. Gemini generates a suggested fix
5. Developer reviews and applies manually

## Constraints

- MVP only (no auto-merge, no CI/CD)
- Only index frontend source files
- Top 3 relevant files max
- No full repo context sent to Gemini

## Architecture Notes

- Use RAG to prevent hallucinations
- Use MongoDB to store embeddings
- Keep prompts deterministic and minimal

## Non-Goals

- Automatic bug fixing
- Production security hardening
- Multi-repo support
