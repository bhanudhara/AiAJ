import { createServerComponentClient } from '@/lib/supabase';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function StudentPage() {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'student') {
    redirect('/teacher');
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', user.id)
    .eq('class_id', (await supabase.from('classes').select('id').eq('date', today).limit(1).single()).data?.id ?? '')
    .single();

  const isPresent = attendance?.status === 'present';

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Student Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold">Daily assessment readiness</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Today’s attendance</h2>
            <p className="mt-2 text-slate-400">Your assessment window unlocks only when you are marked present.</p>
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Status</p>
              <p className={`mt-2 text-2xl font-semibold ${isPresent ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPresent ? 'Present' : 'Awaiting attendance'}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Open assessment</h2>
            <p className="mt-2 text-sm text-slate-400">Your daily assessment opens here as soon as attendance is confirmed.</p>
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Ready state</p>
              <p className={`mt-2 text-lg font-semibold ${isPresent ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPresent ? 'Assessment unlocked' : 'Waiting for teacher attendance'}
              </p>
            </div>
            <Link
              href={isPresent ? '/student/assessment' : '#'}
              className={`mt-6 inline-flex rounded-lg px-5 py-3 font-medium transition ${isPresent ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'cursor-not-allowed bg-slate-800 text-slate-500'}`}
            >
              {isPresent ? 'Open Chat Assessment' : 'Assessment unavailable'}
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
