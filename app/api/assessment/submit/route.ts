import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/src/lib/auth';
import { query, insert } from '@/src/lib/db';
import { buildEvaluation } from '@/src/lib/gemini';
import { getN8nEnv } from '@/src/lib/env';
import { toN8nTopic } from '@/src/lib/n8n';

export const dynamic = 'force-dynamic';

interface QuestionInput {
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
}

interface TopicRow {
  id: string;
  subject: string;
  topic_name: string;
}

async function evaluate(
  studentId: string,
  score: number,
  totalQuestions: number,
  topicResults: Array<{ topic_id: string; subject: string; topic_name: string; score: number }>
) {
  const { evalUrl } = getN8nEnv();

  if (evalUrl) {
    try {
      const res = await fetch(evalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          score,
          totalQuestions,
          topics: topicResults.map((t) => ({
            ...toN8nTopic({ id: t.topic_id, subject: t.subject, topic_name: t.topic_name }),
            score: t.score,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const evaluation = data?.evaluation ?? data;
        const summary = evaluation?.summary ?? '';
        const recommendedVideo =
          evaluation?.recommendedVideo ?? evaluation?.recommended_video ?? '';
        const recommendationUrls =
          evaluation?.recommendationUrls ?? evaluation?.recommendation_urls ?? {};
        return { summary, recommendedVideo, recommendationUrls };
      }
    } catch {
      // fall through to local Gemini evaluation
    }
  }

  return buildEvaluation(score, totalQuestions, topicResults);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can submit assessments' }, { status: 403 });
  }

  const body = await request.json();
  const questions: QuestionInput[] = Array.isArray(body?.questions) ? body.questions : [];
  const answers: Record<number, number> = body?.answers ?? {};
  const today = new Date().toISOString().slice(0, 10);

  if (questions.length === 0) {
    return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
  }

  const topicRows = await query<TopicRow[]>(
    `SELECT t.id, t.subject, t.topic_name
     FROM topics t
     JOIN classes c ON c.id = t.class_id
     WHERE c.date = ?`,
    [today]
  );
  const topicMap = new Map(topicRows.map((t) => [t.id, t]));

  const totalQuestions = questions.length;
  let score = 0;
  const topicResultsMap = new Map<string, { correct: number; total: number }>();
  const perQuestion: Array<{ topic_id: string; correct: boolean }> = [];

  questions.forEach((question, index) => {
    const selected = answers[index];
    const isCorrect = selected === question.correct_option;
    if (isCorrect) score += 1;
    perQuestion.push({ topic_id: question.topic_id, correct: isCorrect });

    const agg = topicResultsMap.get(question.topic_id) ?? { correct: 0, total: 0 };
    agg.total += 1;
    if (isCorrect) agg.correct += 1;
    topicResultsMap.set(question.topic_id, agg);
  });

  const topicResults = Array.from(topicResultsMap.entries()).map(([topic_id, agg]) => {
    const info = topicMap.get(topic_id);
    return {
      topic_id,
      subject: info?.subject ?? 'General',
      topic_name: info?.topic_name ?? topic_id,
      score: agg.correct,
    };
  });

  const strengths = topicResults
    .filter((t) => t.score > 0)
    .map((t) => t.topic_name);
  const weaknesses = topicResults
    .filter((t) => t.score === 0)
    .map((t) => t.topic_name);

  const evaluation = await evaluate(user.id, score, totalQuestions, topicResults);

  const assessmentId = randomUUID();
  await insert(
    `INSERT INTO assessments
       (id, student_id, date, total_score, total_questions, summary, recommended_video, strengths, weaknesses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      assessmentId,
      user.id,
      today,
      score,
      totalQuestions,
      evaluation.summary,
      evaluation.recommendedVideo,
      JSON.stringify(strengths),
      JSON.stringify(weaknesses),
    ]
  );

  for (const q of perQuestion) {
    const urls: string[] = evaluation.recommendationUrls?.[q.topic_id] ?? [];
    await insert(
      `INSERT INTO assessment_details (id, assessment_id, topic_id, score, recommendation_urls)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), assessmentId, q.topic_id, q.correct ? 1 : 0, JSON.stringify(urls)]
    );
  }

  return NextResponse.json({
    ok: true,
    assessmentId,
    score,
    totalQuestions,
    summary: evaluation.summary,
    recommendedVideo: evaluation.recommendedVideo,
    strengths,
    weaknesses,
  });
}
