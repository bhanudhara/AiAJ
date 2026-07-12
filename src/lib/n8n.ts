import { createHash } from 'crypto';

export interface N8nTopic {
  difficulty: string;
  subjectName: string;
  subjectId: string;
  topicName: string;
  topicId: string;
}

export interface N8nTopicInput {
  id: string;
  subject: string;
  topic_name: string;
  difficulty?: string;
}

// n8n uses Salesforce-style IDs. We don't store a subject table, so derive a
// deterministic, stable id from the subject name.
export function deriveSubjectId(subject: string): string {
  const hash = createHash('sha1').update(subject.trim().toLowerCase()).digest('hex').slice(0, 14);
  return `sub_${hash}`;
}

export function toN8nTopic(topic: N8nTopicInput): N8nTopic {
  return {
    difficulty: topic.difficulty ?? 'Easy',
    subjectName: topic.subject,
    subjectId: deriveSubjectId(topic.subject),
    topicName: topic.topic_name,
    topicId: topic.id,
  };
}
