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

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null,
  image_path text,
  created_at timestamptz not null default now(),
  approved boolean not null default true,
  constraint comments_name_length
    check (char_length(btrim(name)) between 1 and 30),
  constraint comments_content_length
    check (char_length(btrim(content)) between 1 and 300)
);

alter table public.comments
  add column if not exists image_path text;

create index if not exists comments_approved_created_at_idx
  on public.comments (approved, created_at desc);

alter table public.comments enable row level security;

revoke all on table public.comments from anon, authenticated;
grant select (id, name, content, image_path, created_at)
  on table public.comments to anon, authenticated;

drop policy if exists "Public comments are readable" on public.comments;
create policy "Public comments are readable"
  on public.comments
  for select
  to anon, authenticated
  using (approved = true);

drop function if exists public.submit_comment(text, text);
drop function if exists public.submit_comment(text, text, text);

create function public.submit_comment(
  p_name text,
  p_content text,
  p_image_path text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(p_name, ''));
  clean_content text := btrim(coalesce(p_content, ''));
  clean_image_path text := nullif(btrim(coalesce(p_image_path, '')), '');
  inserted_comment public.comments;
begin
  if char_length(clean_name) not between 1 and 30 then
    raise exception 'COMMENT_NAME_INVALID';
  end if;

  if char_length(clean_content) not between 1 and 300 then
    raise exception 'COMMENT_CONTENT_INVALID';
  end if;

  if clean_image_path is not null then
    if clean_image_path !~ '^comments/[0-9a-f-]+\.webp$' then
      raise exception 'COMMENT_IMAGE_PATH_INVALID';
    end if;

    if not exists (
      select 1
      from storage.objects
      where bucket_id = 'guestbook-media'
        and name = clean_image_path
    ) then
      raise exception 'COMMENT_IMAGE_NOT_FOUND';
    end if;
  end if;

  if exists (
    select 1
    from public.comments
    where name = clean_name
      and content = clean_content
      and created_at > now() - interval '30 seconds'
  ) then
    raise exception 'COMMENT_DUPLICATE';
  end if;

  insert into public.comments (name, content, image_path)
  values (clean_name, clean_content, clean_image_path)
  returning * into inserted_comment;

  return jsonb_build_object(
    'id', inserted_comment.id,
    'name', inserted_comment.name,
    'content', inserted_comment.content,
    'image_path', inserted_comment.image_path,
    'created_at', inserted_comment.created_at
  );
end;
$$;

revoke all on function public.submit_comment(text, text, text) from public;
grant execute on function public.submit_comment(text, text, text)
  to anon, authenticated;

drop function if exists public.discard_orphan_comment_image(text);

create function public.discard_orphan_comment_image(
  p_image_path text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_image_path text := btrim(coalesce(p_image_path, ''));
  deleted_count integer := 0;
begin
  if clean_image_path !~ '^comments/[0-9a-f-]+\.webp$' then
    return false;
  end if;

  if exists (
    select 1
    from public.comments
    where image_path = clean_image_path
  ) then
    return false;
  end if;

  delete from storage.objects
  where bucket_id = 'guestbook-media'
    and name = clean_image_path;

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

revoke all on function public.discard_orphan_comment_image(text) from public;
grant execute on function public.discard_orphan_comment_image(text)
  to anon, authenticated;

drop function if exists public.delete_comment(uuid);

create function public.delete_comment(p_comment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  comment_image_path text;
begin
  if not public.is_site_admin() then
    raise exception 'COMMENT_DELETE_FORBIDDEN';
  end if;

  select image_path
  into comment_image_path
  from public.comments
  where id = p_comment_id;

  if not found then
    return false;
  end if;

  delete from public.comments
  where id = p_comment_id;

  if comment_image_path is not null then
    delete from storage.objects
    where bucket_id = 'guestbook-media'
      and name = comment_image_path;
  end if;

  return true;
end;
$$;

revoke all on function public.delete_comment(uuid) from public;
grant execute on function public.delete_comment(uuid) to authenticated;
