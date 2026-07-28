create extension if not exists pgcrypto;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'wuyy.77@qq.com';
$$;

grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.interest_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  caption text not null default '',
  shot_date date,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint interest_photos_title_length
    check (char_length(btrim(title)) between 1 and 60),
  constraint interest_photos_category_length
    check (char_length(btrim(category)) between 1 and 30),
  constraint interest_photos_caption_length
    check (char_length(btrim(caption)) <= 240),
  constraint interest_photos_storage_path
    check (storage_path ~ '^wall/[0-9a-f-]+\.webp$')
);

create index if not exists interest_photos_order_idx
  on public.interest_photos (sort_order asc, created_at desc);

alter table public.interest_photos enable row level security;

revoke all on table public.interest_photos from anon, authenticated;
grant select (
  id,
  title,
  category,
  caption,
  shot_date,
  storage_path,
  sort_order,
  created_at
) on table public.interest_photos to anon, authenticated;
grant insert, update, delete on table public.interest_photos to authenticated;

drop policy if exists "Interest photos are publicly readable"
  on public.interest_photos;
create policy "Interest photos are publicly readable"
  on public.interest_photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Site admin manages interest photos"
  on public.interest_photos;
create policy "Site admin manages interest photos"
  on public.interest_photos
  for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'guestbook-media',
  'guestbook-media',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Guestbook media are publicly readable"
  on storage.objects;
create policy "Guestbook media are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'guestbook-media');

drop policy if exists "Visitors upload comment images"
  on storage.objects;
create policy "Visitors upload comment images"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'guestbook-media'
    and name ~ '^comments/[0-9a-f-]+\.webp$'
  );

drop policy if exists "Site admin uploads wall photos"
  on storage.objects;
create policy "Site admin uploads wall photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'guestbook-media'
    and name ~ '^wall/[0-9a-f-]+\.webp$'
    and public.is_site_admin()
  );

drop policy if exists "Site admin updates wall photos"
  on storage.objects;
create policy "Site admin updates wall photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'guestbook-media'
    and name like 'wall/%'
    and public.is_site_admin()
  )
  with check (
    bucket_id = 'guestbook-media'
    and name like 'wall/%'
    and public.is_site_admin()
  );

drop policy if exists "Site admin deletes wall photos"
  on storage.objects;
create policy "Site admin deletes wall photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'guestbook-media'
    and name like 'wall/%'
    and public.is_site_admin()
  );
