import { createServerComponentClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function TeacherPage() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'teacher') {
    redirect('/student');
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Teacher Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold">Create today’s class and topic flow</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Step 1: Create Class</h2>
            <p className="mt-2 text-sm text-slate-400">Generate a new class instance for today.</p>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Class name" />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950">Create Class</button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Step 2: Add Topics</h2>
            <p className="mt-2 text-sm text-slate-400">Append subjects and topic names to the class.</p>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Subject" />
              <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Topic name" />
              <button className="rounded-lg border border-slate-700 px-4 py-2">Add Topic</button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Step 3: Attendance</h2>
            <p className="mt-2 text-sm text-slate-400">Mark today’s attendees from registered students.</p>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <input type="checkbox" className="h-4 w-4" />
                <span>Student One</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <input type="checkbox" className="h-4 w-4" />
                <span>Student Two</span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
