import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ message: 'Файл не выбран' }, { status: 400 });

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: 'Разрешены только изображения (jpg, png, webp, gif)' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ message: 'Файл не должен превышать 5 МБ' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from('tour-images')
    .upload(fileName, bytes, { contentType: file.type });

  if (error) return NextResponse.json({ message: 'Ошибка загрузки: ' + error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('tour-images').getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
