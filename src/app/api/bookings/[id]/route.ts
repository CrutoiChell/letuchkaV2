import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-helper';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (!booking) return NextResponse.json({ message: 'Бронирование не найдено' }, { status: 404 });
  if (booking.user_id !== user!.id) return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });

  await supabase.from('bookings').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
