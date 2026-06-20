import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: 'Ошибка загрузки туров' }, { status: 500 });

  return NextResponse.json({ tours });
}
