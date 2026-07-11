import { NextResponse } from 'next/server';

export async function buildGeminiQuestions(topics: Array<{ id: string; subject: string; topic_name: string }>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return topics.flatMap((topic) => [{
      topic_id: topic.id,
      question_text: `What is the main idea of ${topic.topic_name}?`,
      options: ['A', 'B', 'C', 'D'],
      correct_option: 0,
    }]);
  }

  const prompt = JSON.stringify({
    subjects: topics.reduce((acc, topic) => {
      const existing = acc.find((entry: { subject: string }) => entry.subject === topic.subject);
      if (existing) {
        existing.topics.push({ id: topic.id, topic_name: topic.topic_name });
      } else {
        acc.push({ subject: topic.subject, topics: [{ id: topic.id, topic_name: topic.topic_name }] });
      }
      return acc;
    }, [] as Array<{ subject: string; topics: Array<{ id: string; topic_name: string }> }>),
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are an elite educational assessment engine. Read this JSON payload of subjects and topics taught today. Generate exactly 3 highly relevant MCQs per topic. Each question must include an explicit 'question_text', four 'options', a 'correct_option' index, and the corresponding 'topic_id'. Return your output strictly as a structured JSON object array matching this schema structure, without markdown wrapping or code blocks.\n\n${prompt}` }] }],
    }),
  });

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

  return Array.isArray(parsed) ? parsed : [];
}
