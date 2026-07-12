import { getGeminiKey } from './env';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export interface TopicInput {
  id: string;
  subject: string;
  topic_name: string;
}

export async function buildGeminiQuestions(topics: TopicInput[]) {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    return topics.flatMap((topic) => [
      {
        topic_id: topic.id,
        question_text: `What is the main idea of ${topic.topic_name}?`,
        options: ['A', 'B', 'C', 'D'],
        correct_option: 0,
      },
    ]);
  }

  const prompt = JSON.stringify({
    subjects: topics.reduce((acc: any[], topic: TopicInput) => {
      const existing = acc.find((entry) => entry.subject === topic.subject);
      if (existing) {
        existing.topics.push({ id: topic.id, topic_name: topic.topic_name });
      } else {
        acc.push({ subject: topic.subject, topics: [{ id: topic.id, topic_name: topic.topic_name }] });
      }
      return acc;
    }, []),
  });

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an elite educational assessment engine. Read this JSON payload of subjects and topics taught today. Generate exactly 3 highly relevant MCQs per topic. Each question must include an explicit 'question_text', four 'options', a 'correct_option' index, and the corresponding 'topic_id'. Return your output strictly as a structured JSON object array matching this schema structure, without markdown wrapping or code blocks.\n\n${prompt}`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

  return Array.isArray(parsed) ? parsed : [];
}

export interface EvaluationTopic {
  topic_id: string;
  subject: string;
  topic_name: string;
  score: number;
}

export interface EvaluationResult {
  summary: string;
  recommendedVideo: string;
  recommendationUrls: Record<string, string[]>;
}

export async function buildEvaluation(
  score: number,
  totalQuestions: number,
  topics: EvaluationTopic[]
): Promise<EvaluationResult> {
  const apiKey = getGeminiKey();
  const fallback = (): EvaluationResult => {
    const weak = topics.filter((t) => t.score === 0).map((t) => t.topic_name);
    const search = weak.length ? weak.join(' ') : 'study tips';
    const video = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
    return {
      summary: `You scored ${score}/${totalQuestions}. ${
        weak.length ? `Focus on: ${weak.join(', ')}.` : 'Great work — keep it up.'
      }`,
      recommendedVideo: video,
      recommendationUrls: topics.reduce((acc, t) => {
        acc[t.topic_id] = [`https://www.youtube.com/results?search_query=${encodeURIComponent(t.topic_name)}`];
        return acc;
      }, {} as Record<string, string[]>),
    };
  };

  if (!apiKey) return fallback();

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an academic tutor. A student just completed a daily assessment. Overall score is ${score} out of ${totalQuestions}. Per-topic results: ${JSON.stringify(
                topics
              )}. Respond strictly with a JSON object (no markdown) of the shape: { "summary": string (2-3 sentence encouraging summary of performance), "recommendedVideo": string (a single YouTube search URL for the weakest topic), "recommendationUrls": { "<topic_id>": [string] } } where recommendationUrls maps each topic_id to an array of helpful YouTube search URLs.`,
            },
          ],
        },
      ],
    }),
  });

  try {
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (parsed?.summary) return parsed as EvaluationResult;
    return fallback();
  } catch {
    return fallback();
  }
}
