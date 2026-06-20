import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data: tours, error } = await query;
  if (error) return NextResponse.json({ message: 'Ошибка загрузки туров' }, { status: 500 });

  return NextResponse.json({ tours });
}

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { title, description, price, duration, image, category, features, rating } = body;

  if (!title || !description || !price || !duration || !image || !category) {
    return NextResponse.json({ message: 'Заполните все обязательные поля' }, { status: 400 });
  }

  const { data: tour, error } = await supabase
    .from('tours')
    .insert({ title, description, price, duration, image, category, features: features || [], rating: rating || 4.5 })
    .select()
    .single();

  if (error) return NextResponse.json({ message: 'Ошибка создания тура' }, { status: 500 });

  return NextResponse.json({ tour }, { status: 201 });
}
