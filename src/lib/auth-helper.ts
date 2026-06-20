import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { supabase } from './supabase';
import { NextResponse } from 'next/server';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, phone, role, avatar, notifications, newsletter, created_at')
    .eq('id', payload.userId)
    .single();

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) return { user: null, response: NextResponse.json({ message: 'Не авторизован' }, { status: 401 }) };
  return { user, response: null };
}

export async function requireAdmin() {
  const { user, response } = await requireAuth();
  if (response) return { user: null, response };
  if (user!.role !== 'admin') return { user: null, response: NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 }) };
  return { user: user!, response: null };
}
