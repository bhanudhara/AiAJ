import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export const dynamic = 'force-dynamic';

// n8n evaluation callback. n8n can POST back the computed evaluation for an
// assessment (e.g. if it processes asynchronously instead of responding inline).
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const assessmentId = body?.assessmentId;
  const evaluation = body?.evaluation ?? body;

  if (!assessmentId) {
    return NextResponse.json({ ok: true, received: body });
  }

  const summary = evaluation?.summary ?? evaluation?.summaryText ?? null;
  const recommendedVideo =
    evaluation?.recommendedVideo ?? evaluation?.recommended_video ?? null;

  await query(
    'UPDATE assessments SET summary = COALESCE(?, summary), recommended_video = COALESCE(?, recommended_video) WHERE id = ?',
    [summary, recommendedVideo, assessmentId]
  );

  return NextResponse.json({ ok: true, assessmentId });
}
