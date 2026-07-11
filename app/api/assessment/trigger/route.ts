import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

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

  const questions = (topics ?? []).flatMap((topic: any) => [
    {
      topic_id: topic.id,
      question_text: `What is the main idea of ${topic.topic_name}?`,
      options: ['A', 'B', 'C', 'D'],
      correct_option: 0,
    },
  ]);

  return NextResponse.json({ ok: true, questions });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, payload: body });
}
