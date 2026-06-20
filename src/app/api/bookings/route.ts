import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-helper';

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, tour:tours(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: 'Ошибка загрузки бронирований' }, { status: 500 });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { tourId, notes } = await req.json();
  if (!tourId) return NextResponse.json({ message: 'Укажите тур' }, { status: 400 });

  const { data: tour } = await supabase.from('tours').select('id').eq('id', tourId).single();
  if (!tour) return NextResponse.json({ message: 'Тур не найден' }, { status: 404 });

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ user_id: user!.id, tour_id: tourId, notes: notes || null })
    .select('*, tour:tours(*)')
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка бронирования' }, { status: 500 });

  return NextResponse.json({ booking }, { status: 201 });
}
