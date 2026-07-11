'use client';

import { useState } from 'react';

interface StudentOption {
  id: string;
  full_name: string;
}

interface TeacherDashboardProps {
  students: StudentOption[];
}

export default function TeacherDashboard({ students }: TeacherDashboardProps) {
  const [className, setClassName] = useState('');
  const [topics, setTopics] = useState([{ subject: '', topicName: '' }]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addTopic = () => setTopics((prev) => [...prev, { subject: '', topicName: '' }]);

  const updateTopic = (index: number, field: 'subject' | 'topicName', value: string) => {
    setTopics((prev) => prev.map((topic, topicIndex) => (topicIndex === index ? { ...topic, [field]: value } : topic)));
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/teacher/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ className, topics, studentIds: selectedStudents }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? 'Unable to save class plan.');
      return;
    }

    setMessage(`Saved class plan for ${data.className}.`);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Step 1: Create class</h2>
        <input
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          placeholder="Class name"
          required
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Step 2: Add topics</h2>
          <button type="button" onClick={addTopic} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">
            + Add topic
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {topics.map((topic, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-2">
              <input
                value={topic.subject}
                onChange={(event) => updateTopic(index, 'subject', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Subject"
                required
              />
              <input
                value={topic.topicName}
                onChange={(event) => updateTopic(index, 'topicName', event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Topic name"
                required
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Step 3: Attendance</h2>
        <div className="mt-4 space-y-2">
          {students.length === 0 ? (
            <p className="text-sm text-slate-400">No student profiles found yet.</p>
          ) : (
            students.map((student) => (
              <label key={student.id} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="h-4 w-4"
                />
                <span>{student.full_name}</span>
              </label>
            ))
          )}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button disabled={loading} className="rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950 disabled:opacity-50">
          {loading ? 'Saving…' : 'Save class plan'}
        </button>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </form>
  );
}
