import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { buildGeminiQuestions } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: classes } = await supabase.from('classes').select('*').eq('date', today).limit(1);
  const classId = classes?.[0]?.id;

  if (!classId) {
    return NextResponse.json({ error: 'No class for today' }, { status: 404 });
  }

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', user.id)
    .eq('class_id', classId)
    .single();

  if (!attendance || attendance.status !== 'present') {
    return NextResponse.json({ error: 'Student not present' }, { status: 403 });
  }

  const { data: topics } = await supabase.from('topics').select('*').eq('class_id', classId);

  const questions = await buildGeminiQuestions((topics ?? []).map((topic: any) => ({
    id: topic.id,
    subject: topic.subject,
    topic_name: topic.topic_name,
  })));

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, date: today }),
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
