import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [usersResult, toursResult, bookingsResult, recentBookingsResult] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('*, user:users(name, email), tour:tours(title, price)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return NextResponse.json({
    stats: {
      users: usersResult.count ?? 0,
      tours: toursResult.count ?? 0,
      bookings: bookingsResult.count ?? 0,
    },
    recentBookings: recentBookingsResult.data ?? []
  });
}
