import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user: admin, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  if (id === admin!.id && body.role && body.role !== 'admin') {
    return NextResponse.json({ message: 'Нельзя снять права администратора с себя' }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, name, phone, role, created_at')
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка обновления пользователя' }, { status: 500 });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user: admin, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  if (id === admin!.id) {
    return NextResponse.json({ message: 'Нельзя удалить свой аккаунт' }, { status: 400 });
  }

  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return NextResponse.json({ message: 'Ошибка удаления пользователя' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
