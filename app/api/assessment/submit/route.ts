import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const today = new Date().toISOString().slice(0, 10);
  const { data: assessment } = await supabase
    .from('assessments')
    .insert({ student_id: user.id, date: today, total_score: 0, strengths: [], weaknesses: [] })
    .select()
    .single();

  if (!assessment) {
    return NextResponse.json({ error: 'Unable to create assessment' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, assessment });
}
