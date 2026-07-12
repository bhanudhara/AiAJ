import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/src/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'student') {
    return NextResponse.json({ error: 'Only students can submit assessments' }, { status: 403 });
  }

  const body = await request.json();
  const questions = Array.isArray(body?.questions) ? body.questions : [];
  const answers = body?.answers ?? {};
  const today = new Date().toISOString().slice(0, 10);

  const score = questions.reduce((total: number, question: any, index: number) => {
    const selectedAnswer = answers[index];
    return total + (selectedAnswer === question.correct_option ? 1 : 0);
  }, 0);

  const { data: assessment, error } = await supabase
    .from('assessments')
    .insert({ student_id: user.id, date: today, total_score: score, strengths: score >= 2 ? ['Topic recall'] : [], weaknesses: score < 2 ? ['Review core topics'] : [] })
    .select()
    .single();

  if (error || !assessment) {
    return NextResponse.json({ error: 'Unable to create assessment' }, { status: 500 });
  }

  for (const question of questions) {
    await supabase.from('assessment_details').insert({
      assessment_id: assessment.id,
      topic_id: question.topic_id,
      score: answers[questions.indexOf(question)] === question.correct_option ? 1 : 0,
      recommendation_urls: ['https://www.youtube.com/results?search_query=' + encodeURIComponent(question.topic_id)],
    });
  }

  return NextResponse.json({ ok: true, assessment, score, totalQuestions: questions.length });
}
