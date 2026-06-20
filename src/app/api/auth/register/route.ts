import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password, name, phone } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ message: 'Заполните все обязательные поля' }, { status: 400 });
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return NextResponse.json({ message: 'Имя должно содержать от 2 до 50 символов' }, { status: 400 });
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(trimmedName)) {
    return NextResponse.json({ message: 'Имя должно содержать только буквы' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Введите корректный email' }, { status: 400 });
  }
  if (password.length < 8 || !/[a-zA-Zа-яА-ЯёЁ]/.test(password) || !/\d/.test(password)) {
    return NextResponse.json({ message: 'Пароль должен содержать минимум 8 символов, букву и цифру' }, { status: 400 });
  }
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    const validPhone = (digits.length === 11 && /^[78]/.test(digits)) || digits.length === 10;
    if (!validPhone) return NextResponse.json({ message: 'Введите корректный номер телефона' }, { status: 400 });
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
