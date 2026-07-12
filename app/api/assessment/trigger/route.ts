import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth';
import { query } from '@/src/lib/db';
import { buildGeminiQuestions } from '@/src/lib/gemini';
import { getN8nEnv } from '@/src/lib/env';
import { toN8nTopic } from '@/src/lib/n8n';

export const dynamic = 'force-dynamic';

interface TopicRow {
  id: string;
  class_id: string;
  subject: string;
  topic_name: string;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can access assessments' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const present = await query<Array<{ class_id: string }>>(
    `SELECT a.class_id
     FROM attendance a
     JOIN classes c ON c.id = a.class_id
     WHERE a.student_id = ? AND a.status = 'present' AND c.date = ?
     ORDER BY c.date DESC
     LIMIT 1`,
    [user.id, today]
  );
  const classId = present[0]?.class_id;
  if (!classId) {
    return NextResponse.json({ error: 'Student not present for today' }, { status: 403 });
  }

  const topics = await query<TopicRow[]>('SELECT * FROM topics WHERE class_id = ?', [classId]);
  const questions = await buildGeminiQuestions(
    (topics ?? []).map((topic) => ({ id: topic.id, subject: topic.subject, topic_name: topic.topic_name }))
  );

  const { triggerUrl } = getN8nEnv();
  if (triggerUrl) {
    try {
      await fetch(triggerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          date: today,
          topics: (topics ?? []).map((topic) =>
            toN8nTopic({ id: topic.id, subject: topic.subject, topic_name: topic.topic_name })
          ),
        }),
      });
    } catch {
      // ignore webhook errors and continue with local fallback
    }
  }

  return NextResponse.json({ ok: true, questions });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, payload: body });
}
