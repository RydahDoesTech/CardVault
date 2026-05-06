-- CardVault — Supabase schema, RLS, storage
-- Run this in the Supabase SQL editor (or via migrations).

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  external_card_id text not null,
  game text not null default 'pokemon',
  name text not null,
  set_name text,
  card_number text,
  rarity text,
  image_url text,
  created_at timestamptz not null default now(),
  unique (game, external_card_id)
);

create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  condition text not null,
  quantity integer not null default 1 check (quantity >= 1),
  purchase_price numeric,
  estimated_value numeric,
  notes text,
  front_image_url text,
  back_image_url text,
  last_price_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_cards_user_id_idx on public.user_cards (user_id);
create index if not exists user_cards_card_id_idx on public.user_cards (card_id);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  user_card_id uuid not null references public.user_cards (id) on delete cascade,
  source text not null,
  low_price numeric,
  average_price numeric,
  high_price numeric,
  market_price numeric,
  checked_at timestamptz not null default now()
);

create index if not exists price_history_user_card_id_idx on public.price_history (user_card_id);

-- ---------------------------------------------------------------------------
-- Triggers: profile on signup, updated_at
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_cards_set_updated_at on public.user_cards;
create trigger user_cards_set_updated_at
  before update on public.user_cards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.user_cards enable row level security;
alter table public.price_history enable row level security;

-- profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Catalog cards: readable by signed-in users; app can insert catalog entries
create policy "Authenticated read cards catalog"
  on public.cards for select
  to authenticated
  using (true);

create policy "Authenticated insert cards catalog"
  on public.cards for insert
  to authenticated
  with check (true);

-- user_cards
create policy "Users read own collection"
  on public.user_cards for select
  using (auth.uid() = user_id);

create policy "Users insert own collection"
  on public.user_cards for insert
  with check (auth.uid() = user_id);

create policy "Users update own collection"
  on public.user_cards for update
  using (auth.uid() = user_id);

create policy "Users delete own collection"
  on public.user_cards for delete
  using (auth.uid() = user_id);

-- price_history: scoped through user_cards ownership
create policy "Users read own price history"
  on public.price_history for select
  using (
    exists (
      select 1 from public.user_cards uc
      where uc.id = price_history.user_card_id
        and uc.user_id = auth.uid()
    )
  );

create policy "Users insert own price history"
  on public.price_history for insert
  with check (
    exists (
      select 1 from public.user_cards uc
      where uc.id = price_history.user_card_id
        and uc.user_id = auth.uid()
    )
  );

create policy "Users update own price history"
  on public.price_history for update
  using (
    exists (
      select 1 from public.user_cards uc
      where uc.id = price_history.user_card_id
        and uc.user_id = auth.uid()
    )
  );

create policy "Users delete own price history"
  on public.price_history for delete
  using (
    exists (
      select 1 from public.user_cards uc
      where uc.id = price_history.user_card_id
        and uc.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: user card images
-- Create bucket in Dashboard → Storage → New bucket → name: user-card-images, private.
-- Or uncomment below if your project allows SQL bucket creation:
-- insert into storage.buckets (id, name, public) values ('user-card-images', 'user-card-images', false);

-- Policies for storage.objects (private bucket, path: {user_id}/...)
-- Run after bucket exists.

create policy "Users upload own images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-card-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users read own images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-card-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users update own images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-card-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users delete own images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-card-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );
