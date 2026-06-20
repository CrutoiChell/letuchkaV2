import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Введите email и пароль' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, phone, role, avatar, notifications, newsletter, password_hash')
    .eq('email', email)
    .single();

  if (!user) {
    return NextResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _, ...safeUser } = user;

  const response = NextResponse.json({ user: safeUser });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
