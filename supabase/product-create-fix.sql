create extension if not exists "pgcrypto";

alter table if exists public.products
  add column if not exists subcategory text default '',
  add column if not exists original_price numeric,
  add column if not exists video_url text,
  add column if not exists dimensions text default '',
  add column if not exists care_instructions text default '',
  add column if not exists shipping_info text default '',
  add column if not exists is_featured boolean default false,
  add column if not exists featured boolean default false,
  add column if not exists in_stock boolean default true,
  add column if not exists stock_count integer default 0,
  add column if not exists inventory integer default 0,
  add column if not exists active boolean default true,
  add column if not exists tags text[] default '{}',
  add column if not exists rating jsonb default '{"average":0,"count":0}'::jsonb,
  add column if not exists variants text[] default '{}',
  add column if not exists updated_at timestamptz default now();

update public.products
set
  subcategory = coalesce(subcategory, ''),
  description = coalesce(description, ''),
  dimensions = coalesce(dimensions, ''),
  care_instructions = coalesce(care_instructions, ''),
  shipping_info = coalesce(shipping_info, ''),
  is_featured = coalesce(is_featured, featured, false),
  featured = coalesce(featured, is_featured, false),
  in_stock = coalesce(in_stock, true),
  stock_count = coalesce(stock_count, inventory, 0),
  inventory = coalesce(inventory, stock_count, 0),
  active = coalesce(active, true),
  tags = coalesce(tags, '{}'),
  rating = coalesce(rating, '{"average":0,"count":0}'::jsonb),
  variants = coalesce(variants, '{}'),
  updated_at = coalesce(updated_at, now());

create index if not exists products_active_created_idx on public.products(active, created_at desc);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_featured_idx on public.products(is_featured, featured);

alter table public.products enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (active = true);

