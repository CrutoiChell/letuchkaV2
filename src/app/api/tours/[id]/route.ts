import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tour } = await supabase.from('tours').select('*').eq('id', id).single();
  if (!tour) return NextResponse.json({ message: 'Тур не найден' }, { status: 404 });
  return NextResponse.json({ tour });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  const { data: tour, error } = await supabase
    .from('tours')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка обновления тура' }, { status: 500 });
  return NextResponse.json({ tour });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) return NextResponse.json({ message: 'Ошибка удаления тура' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
