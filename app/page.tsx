import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-400">AI Daily Assessment</p>
        <h1 className="text-4xl font-semibold text-white">Automated Assessment System</h1>
        <p className="mt-4 text-lg text-slate-300">
          A full-stack Next.js flow for teacher-led class setup, student attendance gating, and Gemini-powered daily assessment generation.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/login?role=teacher" className="rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950">Access as Teacher</Link>
          <Link href="/login?role=student" className="rounded-lg border border-slate-700 px-5 py-3 font-medium text-white">Access as Student</Link>
        </div>
      </div>
    </main>
  );
}
