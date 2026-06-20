import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, user:users(id, name, email, phone), tour:tours(id, title, price, duration)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: 'Ошибка загрузки бронирований' }, { status: 500 });

  return NextResponse.json({ bookings });
}
