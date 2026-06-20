import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { status } = await req.json();

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, user:users(name, email), tour:tours(title, price)')
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка обновления бронирования' }, { status: 500 });
  return NextResponse.json({ booking });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) return NextResponse.json({ message: 'Ошибка удаления бронирования' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
