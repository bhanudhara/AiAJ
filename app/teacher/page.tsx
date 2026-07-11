import { createServerComponentClient } from '@/lib/supabase';
import TeacherDashboard from '@/components/teacher-dashboard';
import { redirect } from 'next/navigation';

export default async function TeacherPage({ searchParams }: { searchParams?: { role?: string } }) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?role=teacher');
  }

  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle() : { data: null };

  if (!profile || profile.role !== 'teacher') {
    redirect('/login?role=teacher');
  }

  const { data: students } = await supabase.from('profiles').select('id, full_name').eq('role', 'student');

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Teacher Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold">Create today’s class and topic flow</h1>
        </div>

        <TeacherDashboard students={(students ?? []) as Array<{ id: string; full_name: string }> } />
      </div>
    </main>
  );
}
