// app/api/teacher/plan/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/src/lib/supabase-server'; 

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Correct client initialization for API Route Handlers
  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const { className, topics, studentIds } = body as { 
    className: string; 
    topics: Array<{ subject: string; topicName: string }>; 
    studentIds: string[] 
  };

  if (!className) {
    return NextResponse.json({ error: 'Class name required' }, { status: 400 });
  }

  // Handle Demo Mode safely. 
  // WARNING: If teacher_id relies on a standard Postgres UUID column foreign key, 
  // 'demo-teacher' string will trigger a DB crash. Use a fallback block or valid UUID string if unauthenticated.
  const teacherId = user?.id ?? '00000000-0000-0000-0000-000000000000'; 
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create class plans' }, { status: 403 });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: classRecord, error: classError } = await supabase
    .from('classes')
    .insert({ teacher_id: teacherId, class_name: className, date: today })
    .select()
    .single();

  if (classError || !classRecord) {
    console.error('Supabase DB Insert Error:', classError); // Check server console for this log!
    return NextResponse.json({ error: 'Unable to create class', details: classError?.message }, { status: 500 });
  }

  // Optimize: Fire bulk insertion promises cleanly
  if (topics && topics.length > 0) {
    const topicInserts = topics
      .filter((item) => item.subject && item.topicName)
      .map((topic) => supabase.from('topics').insert({ class_id: classRecord.id, subject: topic.subject, topic_name: topic.topicName }));
    await Promise.all(topicInserts);
  }

  if (studentIds && studentIds.length > 0) {
    const attendanceInserts = studentIds.map((studentId) => 
      supabase.from('attendance').insert({ class_id: classRecord.id, student_id: studentId, status: 'absent' })
    );
    await Promise.all(attendanceInserts);
  }

  return NextResponse.json({ ok: true, className, classId: classRecord.id });
}
