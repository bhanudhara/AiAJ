"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
}

interface EvaluationResult {
  assessmentId: string;
  score: number;
  totalQuestions: number;
  summary: string;
  recommendedVideo: string;
  strengths: string[];
  weaknesses: string[];
}

export default function AssessmentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/assessment/trigger')
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.replace('/login?role=student');
            return;
          }
        }
        if (payload.questions) {
          setQuestions(payload.questions);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const currentQuestion = questions[activeIndex];
  const progress = useMemo(
    () => ((activeIndex + 1) / Math.max(questions.length, 1)) * 100,
    [activeIndex, questions.length]
  );

  const submitAssessment = async () => {
    setSubmitting(true);
    const payload = {
      answers,
      questions,
      submittedAt: new Date().toISOString(),
    };

    const response = await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      alert(data.error ?? 'Unable to submit assessment.');
      return;
    }
    setResult(data);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading assessment…</div>;
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Evaluation complete</p>
          <h1 className="text-3xl font-semibold">
            Score: {result.score}/{result.totalQuestions}
          </h1>

          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-lg font-semibold text-cyan-400">Summary</h2>
            <p className="mt-2 text-slate-300">{result.summary || 'No summary was generated.'}</p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="text-lg font-semibold text-emerald-400">Strengths</h2>
              {result.strengths.length ? (
                <ul className="mt-2 list-disc pl-5 text-slate-300">
                  {result.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">None yet.</p>
              )}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="text-lg font-semibold text-rose-400">Needs work</h2>
              {result.weaknesses.length ? (
                <ul className="mt-2 list-disc pl-5 text-slate-300">
                  {result.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Great job across the board!</p>
              )}
            </section>
          </div>

          {result.recommendedVideo ? (
            <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="text-lg font-semibold text-cyan-400">Recommended video</h2>
              <a
                href={result.recommendedVideo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block break-all text-cyan-400 hover:underline"
              >
                {result.recommendedVideo}
              </a>
            </section>
          ) : null}

          <button
            onClick={() => router.push('/student')}
            className="rounded-lg bg-emerald-500 px-5 py-3 font-medium text-slate-950"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">No questions available.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Daily Assessment</p>
        <h1 className="mt-3 text-3xl font-semibold">{currentQuestion.question_text}</h1>
        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                answers[activeIndex] === index ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-950'
              }`}
              onClick={() => setAnswers((prev) => ({ ...prev, [activeIndex]: index }))}
            >
              <span>{option}</span>
              <span className="text-sm text-slate-400">{index + 1}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button className="rounded-lg border border-slate-700 px-4 py-2" onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}>
            Previous
          </button>
          {activeIndex < questions.length - 1 ? (
            <button className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950" onClick={() => setActiveIndex((prev) => prev + 1)}>
              Next
            </button>
          ) : (
            <button
              disabled={submitting}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
              onClick={submitAssessment}
            >
              {submitting ? 'Evaluating…' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
