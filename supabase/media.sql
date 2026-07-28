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
  approved boolean not null default false,
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

alter table public.interest_photos
  add column if not exists approved boolean not null default true;

alter table public.interest_photos
  alter column approved set default false;

create index if not exists interest_photos_order_idx
  on public.interest_photos (sort_order asc, created_at desc);

create index if not exists interest_photos_approved_order_idx
  on public.interest_photos (approved, sort_order asc, created_at desc);

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
  approved,
  created_at
) on table public.interest_photos to anon, authenticated;
grant insert, update, delete on table public.interest_photos to authenticated;

drop policy if exists "Interest photos are publicly readable"
  on public.interest_photos;
create policy "Interest photos are publicly readable"
  on public.interest_photos
  for select
  to anon, authenticated
  using (approved = true);

drop policy if exists "Site admin manages interest photos"
  on public.interest_photos;
create policy "Site admin manages interest photos"
  on public.interest_photos
  for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop function if exists public.submit_interest_photo(text, text, text, date, text);

create function public.submit_interest_photo(
  p_title text,
  p_category text,
  p_caption text,
  p_shot_date date,
  p_storage_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_title text := btrim(coalesce(p_title, ''));
  clean_category text := btrim(coalesce(p_category, ''));
  clean_caption text := btrim(coalesce(p_caption, ''));
  clean_storage_path text := btrim(coalesce(p_storage_path, ''));
  inserted_photo public.interest_photos;
begin
  if char_length(clean_title) not between 1 and 60 then
    raise exception 'PHOTO_TITLE_INVALID';
  end if;

  if char_length(clean_category) not between 1 and 30 then
    raise exception 'PHOTO_CATEGORY_INVALID';
  end if;

  if char_length(clean_caption) > 240 then
    raise exception 'PHOTO_CAPTION_INVALID';
  end if;

  if clean_storage_path !~ '^wall/[0-9a-f-]+\.webp$' then
    raise exception 'PHOTO_STORAGE_PATH_INVALID';
  end if;

  if not exists (
    select 1
    from storage.objects
    where bucket_id = 'guestbook-media'
      and name = clean_storage_path
  ) then
    raise exception 'PHOTO_STORAGE_OBJECT_NOT_FOUND';
  end if;

  insert into public.interest_photos (
    title,
    category,
    caption,
    shot_date,
    storage_path,
    approved
  )
  values (
    clean_title,
    clean_category,
    clean_caption,
    p_shot_date,
    clean_storage_path,
    false
  )
  returning * into inserted_photo;

  return jsonb_build_object(
    'id', inserted_photo.id,
    'title', inserted_photo.title,
    'category', inserted_photo.category,
    'caption', inserted_photo.caption,
    'shot_date', inserted_photo.shot_date,
    'storage_path', inserted_photo.storage_path,
    'sort_order', inserted_photo.sort_order,
    'approved', inserted_photo.approved,
    'created_at', inserted_photo.created_at
  );
end;
$$;

revoke all on function public.submit_interest_photo(text, text, text, date, text) from public;
grant execute on function public.submit_interest_photo(text, text, text, date, text)
  to anon, authenticated;

drop function if exists public.discard_orphan_wall_image(text);

create function public.discard_orphan_wall_image(p_storage_path text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_storage_path text := btrim(coalesce(p_storage_path, ''));
  deleted_count integer := 0;
begin
  if clean_storage_path !~ '^wall/[0-9a-f-]+\.webp$' then
    return false;
  end if;

  if exists (
    select 1
    from public.interest_photos
    where storage_path = clean_storage_path
  ) then
    return false;
  end if;

  delete from storage.objects
  where bucket_id = 'guestbook-media'
    and name = clean_storage_path;

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

revoke all on function public.discard_orphan_wall_image(text) from public;
grant execute on function public.discard_orphan_wall_image(text)
  to anon, authenticated;

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

drop policy if exists "Visitors upload pending wall photos"
  on storage.objects;
create policy "Visitors upload pending wall photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'guestbook-media'
    and name ~ '^wall/[0-9a-f-]+\.webp$'
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
