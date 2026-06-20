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
  const allowed = ['name', 'phone', 'avatar', 'notifications', 'newsletter'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, name, phone, role, avatar, notifications, newsletter')
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка обновления профиля' }, { status: 500 });
  return NextResponse.json({ user: updated });
}
