import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, toSessionUser } from '@/src/lib/users';
import { setSessionCookie } from '@/src/lib/auth';
import type { Role } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const full_name = String(body?.fullName ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const role: Role = body?.role === 'teacher' ? 'teacher' : 'student';

  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'Full name, email and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const user = await createUser({ full_name, email, password, role });
  await setSessionCookie(toSessionUser(user));

  return NextResponse.json({
    ok: true,
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
  });
}
