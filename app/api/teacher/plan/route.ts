import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/src/lib/auth';
import { insert, bulkInsert, query } from '@/src/lib/db';

export const dynamic = 'force-dynamic';

interface PlanBody {
  className: string;
  topics: Array<{ subject: string; topicName: string }>;
  studentIds: string[];
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can create class plans' }, { status: 403 });
  }

  const body = (await request.json()) as PlanBody;
  const { className, topics, studentIds } = body;

  if (!className) {
    return NextResponse.json({ error: 'Class name required' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const classId = randomUUID();
  await insert(
    'INSERT INTO classes (id, teacher_id, class_name, date) VALUES (?, ?, ?, ?)',
    [classId, user.id, className, today]
  );

  if (topics && topics.length > 0) {
    const topicValues = topics
      .filter((item) => item.subject && item.topicName)
      .map((topic) => [randomUUID(), classId, topic.subject, topic.topicName]);
    if (topicValues.length > 0) {
      await bulkInsert(
        'INSERT INTO topics (id, class_id, subject, topic_name) VALUES ?',
        topicValues
      );
    }
  }

  // Create attendance rows. Selected students are marked present; the rest absent.
  if (studentIds && studentIds.length > 0) {
    const presentSet = new Set(studentIds);
    const allStudents = await query<Array<{ id: string }>>(
      "SELECT id FROM users WHERE role = 'student'"
    );
    const attendanceValues = allStudents.map((s) => [
      randomUUID(),
      classId,
      s.id,
      presentSet.has(s.id) ? 'present' : 'absent',
    ]);
    if (attendanceValues.length > 0) {
      await bulkInsert(
        'INSERT INTO attendance (id, class_id, student_id, status) VALUES ?',
        attendanceValues
      );
    }
  }

  return NextResponse.json({ ok: true, className, classId });
}
