import { NextResponse } from 'next/server';
import { verifyCredentials, toSessionUser } from '@/src/lib/users';
import { setSessionCookie } from '@/src/lib/auth';
import type { Role } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const requestedRole = body?.role === 'teacher' ? 'teacher' : ('student' as Role);

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (user.role !== requestedRole) {
    return NextResponse.json(
      { error: `This account is registered as a ${user.role}.` },
      { status: 403 }
    );
  }

  await setSessionCookie(toSessionUser(user));

  return NextResponse.json({
    ok: true,
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
  });
}
