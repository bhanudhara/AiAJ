# Automated AI Daily Assessment System

A full-stack Next.js 14 App Router app for teacher-led class setup, student attendance gating, and Gemini-powered daily assessments — with **MySQL** storage, **JWT role-based auth**, and **n8n evaluation** that returns a per-student summary and recommended video.

## What changed
- **Database**: Supabase removed. All data now lives in **MySQL** via `mysql2` (see `mysql/schema.sql`).
- **Authentication**: Custom JWT session auth (no external auth provider). Roles are `teacher` and `student`, enforced in `middleware.ts` and every protected route.
- **Evaluation**: On assessment submit, the app calls the n8n evaluation webhook and stores the returned `summary` and `recommendedVideo` against the student's assessment record.

## Environment variables
Create a `.env.local` with:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=ai_aj
AUTH_SECRET=some-long-random-string
N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/generateMCQ
N8N_EVAL_WEBHOOK_URL=https://your-n8n.example.com/webhook/evaluate-assessment
GEMINI_API_KEY=your-gemini-api-key
```

## Setup
1. Run the schema: `mysql -u <user> -p <database> < mysql/schema.sql`
2. `npm install`
3. `npm run dev`

## Role-based auth
- `/signup` and `/login` accept `?role=teacher` or `?role=student`.
- `app/api/auth/login` and `app/api/auth/signup` verify/store credentials in MySQL (bcrypt) and issue an `httpOnly` JWT cookie.
- `middleware.ts` verifies the JWT and redirects users away from routes that don't match their role.

## n8n evaluation flow
1. Student submits an assessment -> `app/api/assessment/submit`.
2. The route computes the score and topic-level results, then POSTs to `N8N_EVAL_WEBHOOK_URL`.
3. n8n (see `n8n/assessment-workflow.json`) groups topics, calls Gemini, and returns `{ summary, recommendedVideo, recommendationUrls }`.
4. The response is stored on the `assessments` row and shown to the student (summary + recommended video), with per-topic recommendation URLs saved to `assessment_details`.
5. If n8n is unreachable, the server falls back to a direct Gemini evaluation.

## API routes
- `POST /api/auth/login` | `POST /api/auth/signup` | `POST /api/auth/logout` | `GET /api/auth/me`
- `GET /api/assessment/trigger` (students only; checks attendance)
- `POST /api/assessment/submit` (students only; calls n8n evaluation)
- `POST /api/assessment/webhook` (n8n evaluation callback)
- `POST /api/teacher/plan` (teachers only; creates class, topics, attendance)

## Database schema
Run `mysql/schema.sql`. Tables: `users`, `classes`, `topics`, `attendance`, `assessments`, `assessment_details`.
