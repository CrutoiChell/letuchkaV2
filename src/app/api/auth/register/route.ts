import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password, name, phone } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ message: 'Заполните все обязательные поля' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 409 });
  }

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const role = count === 0 ? 'admin' : 'user';

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, name, phone: phone || null, password_hash, role })
    .select('id, email, name, phone, role, avatar, notifications, newsletter')
    .single();

  if (error || !user) {
    return NextResponse.json({ message: 'Ошибка создания пользователя' }, { status: 500 });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({ user }, { status: 201 });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
