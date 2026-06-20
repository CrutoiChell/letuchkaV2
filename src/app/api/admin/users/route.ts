import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: 'Ошибка загрузки пользователей' }, { status: 500 });

  return NextResponse.json({ users });
}
