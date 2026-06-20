import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  return NextResponse.json({ user });

}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });

  const body = await req.json();

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json({ message: 'Имя должно содержать от 2 до 50 символов' }, { status: 400 });
    }
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name)) {
      return NextResponse.json({ message: 'Имя должно содержать только буквы' }, { status: 400 });
    }
    body.name = name;
  }

  const allowed = ['name', 'phone', 'telegram', 'avatar', 'notifications', 'newsletter'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, name, phone, telegram, role, avatar, notifications, newsletter')
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка обновления профиля' }, { status: 500 });
  return NextResponse.json({ user: updated });
}
