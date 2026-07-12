import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { query, insert } from './db';
import type { Role, SessionUser, UserRecord } from '@/types';

export interface UserRow extends UserRecord {
  password_hash: string;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] ?? null;
}

export async function createUser(input: {
  full_name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<UserRecord> {
  const id = randomUUID();
  const password_hash = await bcrypt.hash(input.password, 10);
  await insert(
    'INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [id, input.full_name, input.email, password_hash, input.role]
  );
  return {
    id,
    full_name: input.full_name,
    email: input.email,
    role: input.role,
    created_at: new Date().toISOString(),
  };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<UserRow | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}

export async function listStudents(): Promise<Array<{ id: string; full_name: string }>> {
  const rows = await query<Array<{ id: string; full_name: string }>>(
    "SELECT id, full_name FROM users WHERE role = 'student' ORDER BY full_name"
  );
  return rows;
}
