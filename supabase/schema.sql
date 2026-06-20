-- Run this SQL in your Supabase SQL Editor

-- Users table (custom auth, not Supabase Auth)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  phone text,
  password_hash text not null,
  role text default 'user' check (role in ('user', 'admin')),
  avatar text,
  notifications boolean default true,
  newsletter boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tours table
create table if not exists tours (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  price text not null,
  duration text not null,
  image text not null,
  category text not null check (category in ('popular', 'exotic', 'europe')),
  features text[] default '{}',
  rating numeric(3,1) default 4.5,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Disable RLS (server uses service role key)
alter table users disable row level security;
alter table tours disable row level security;
alter table bookings disable row level security;

-- Seed initial tours
insert into tours (title, description, price, duration, image, category, features, rating) values
('Магия Бали', 'Откройте для себя тропический рай с белоснежными пляжами, древними храмами и захватывающими рисовыми террасами.', 'от 120 000 ₽', '12 дней', '/bali.jpg', 'exotic', ARRAY['Все включено', 'Персональный гид', 'Спа-процедуры', 'Экскурсии'], 4.7),
('Очарование Парижа', 'Погрузитесь в романтическую атмосферу города любви, искусства и изысканной кухни.', 'от 95 000 ₽', '7 дней', '/paris.jpg', 'europe', ARRAY['Завтраки', 'Экскурсии', 'Речной круиз', 'Дегустации'], 4.9),
('Мальдивский рай', 'Насладитесь безмятежным отдыхом в роскошных виллах над кристально чистой водой.', 'от 180 000 ₽', '10 дней', '/maldives.jpg', 'popular', ARRAY['Премиум всё включено', 'Спа-центр', 'Водные виды спорта', 'Трансфер'], 4.8),
('Солнечная Греция', 'Погрузитесь в греческий колорит, сияющие белоснежные пляжи и древние руины.', 'от 150 000 ₽', '14 дней', '/greece.jpg', 'popular', ARRAY['Все включено', 'Экскурсии', 'Рестораны', 'Спа-процедуры'], 4.8),
('Магическая Италия', 'Погрузитесь в романтическую атмосферу Италии с её древними городами и удивительными памятниками.', 'от 120 000 ₽', '10 дней', '/italy.jpg', 'europe', ARRAY['Все включено', 'Экскурсии', 'Рестораны', 'Спа-процедуры'], 4.9),
('Экзотический Таиланд', 'Насладитесь отдыхом на белоснежных пляжах Таиланда с его удивительными водопадами и древней культурой.', 'от 75 000 ₽', '12 дней', '/thailand.jpg', 'exotic', ARRAY['Все включено', 'Экскурсии', 'Рестораны', 'Спа-процедуры'], 4.7);
