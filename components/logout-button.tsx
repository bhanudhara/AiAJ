"use client";

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  };
  return (
    <button
      onClick={logout}
      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
    >
      Log out
    </button>
  );
}
