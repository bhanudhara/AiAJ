import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json({ ok: true, received: payload });
}
