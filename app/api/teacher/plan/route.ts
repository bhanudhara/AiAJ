import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { className, topics, studentIds } = body as { className: string; topics: Array<{ subject: string; topicName: string }>; studentIds: string[] };

  if (!className) {
    return NextResponse.json({ error: 'Class name required' }, { status: 400 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can create class plans' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: classRecord, error: classError } = await supabase
    .from('classes')
    .insert({ teacher_id: user.id, class_name: className, date: today })
    .select()
    .single();

  if (classError || !classRecord) {
    return NextResponse.json({ error: 'Unable to create class' }, { status: 500 });
  }

  for (const topic of topics.filter((item) => item.subject && item.topicName)) {
    await supabase.from('topics').insert({ class_id: classRecord.id, subject: topic.subject, topic_name: topic.topicName });
  }

  for (const studentId of studentIds) {
    await supabase.from('attendance').insert({ class_id: classRecord.id, student_id: studentId, status: 'absent' });
  }

  return NextResponse.json({ ok: true, className, classId: classRecord.id });
}
