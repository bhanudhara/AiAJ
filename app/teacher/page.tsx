import { redirect } from 'next/navigation';
import TeacherDashboard from '@/components/teacher-dashboard';
import LogoutButton from '@/components/logout-button';
import { getCurrentUser } from '@/src/lib/auth';
import { listStudents } from '@/src/lib/users';

export const dynamic = 'force-dynamic';

export default async function TeacherPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?role=teacher');
  if (user.role !== 'teacher') redirect('/login?role=teacher');

  const students = await listStudents();

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Teacher Workspace</p>
              <h1 className="mt-3 text-3xl font-semibold">Create today’s class and topic flow</h1>
            </div>
            <LogoutButton />
          </div>

        <TeacherDashboard students={students} />
      </div>
    </main>
  );
}
