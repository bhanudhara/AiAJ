# Automated AI Daily Assessment System

This workspace contains a starter Next.js 14 App Router implementation for an AI assessment flow based on Supabase, n8n, and Google Gemini.

## Included pieces
- Supabase SSR client helpers
- Teacher dashboard shell
- Student dashboard shell
- Assessment wizard UI
- API routes for assessment trigger and submit
- SQL migration scaffold for Supabase

## Environment variables
Create a .env.local with:

NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
N8N_WEBHOOK_URL=https://your-n8n-instance.example.com/webhook/assessment-trigger

## n8n workflow outline
1. Webhook node receives { studentId, date }
2. Supabase node fetches attendance, classes, and topics for the day
3. Code node groups topics by subject
4. Gemini node generates MCQ payloads
5. Supabase node writes assessment rows and returns quiz payload
6. Student submit triggers evaluation and stores strengths, weaknesses, and recommendation URLs

## What is now wired
- Teacher dashboard saves a class, topics, and attendance rows to Supabase
- Student dashboard checks attendance from Supabase before enabling the assessment flow
- Assessment trigger calls an optional n8n webhook and falls back to local questions
- Assessment submission writes results into assessments and assessment_details

## Database migration
Run the SQL in supabase/schema.sql in your Supabase SQL editor.
