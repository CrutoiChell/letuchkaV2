import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret');
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Переменные ADMIN_EMAIL и ADMIN_PASSWORD не заданы' },
      { status: 500 }
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin', password_hash, updated_at: new Date().toISOString() })
      .eq('email', email);
    if (error) return NextResponse.json({ message: 'Ошибка обновления' }, { status: 500 });
    return NextResponse.json({ message: 'Администратор обновлён' });
  }

  const { error } = await supabase
    .from('users')
    .insert({ email, name, password_hash, role: 'admin' });

  if (error) return NextResponse.json({ message: 'Ошибка создания' }, { status: 500 });
  return NextResponse.json({ message: 'Администратор создан' }, { status: 201 });
}
