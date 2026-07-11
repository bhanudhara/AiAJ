"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../src/lib/supabase-clinet';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(role === 'teacher' ? '/teacher' : '/student');
      }
    });
  }, [role, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setMessage(error?.message ?? 'Login failed');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profileError || !profile) {
      setMessage('Unable to load account role.');
      setLoading(false);
      return;
    }

    if (profile.role !== role) {
      setMessage(`This account is registered as a ${profile.role}.`);
      setLoading(false);
      return;
    }

    router.replace(role === 'teacher' ? '/teacher' : '/student');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Secure access</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{role === 'teacher' ? 'Teacher login' : 'Student login'}</h1>
        <p className="mt-2 text-sm text-slate-400">Use your Supabase-authenticated account to access the role-specific workspace.</p>
        <div className="mt-6 space-y-4">
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Password" />
        </div>
        {message ? <p className="mt-4 text-sm text-rose-400">{message}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-medium text-slate-950 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link href={`/signup?role=${role}`} className="text-cyan-400 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
