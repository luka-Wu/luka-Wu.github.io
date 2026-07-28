create extension if not exists pgcrypto;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null,
  created_at timestamptz not null default now(),
  approved boolean not null default true,
  constraint comments_name_length
    check (char_length(btrim(name)) between 1 and 30),
  constraint comments_content_length
    check (char_length(btrim(content)) between 1 and 300)
);

create index if not exists comments_approved_created_at_idx
  on public.comments (approved, created_at desc);

alter table public.comments enable row level security;

revoke all on table public.comments from anon, authenticated;
grant select (id, name, content, created_at)
  on table public.comments to anon, authenticated;

drop policy if exists "Public comments are readable" on public.comments;
create policy "Public comments are readable"
  on public.comments
  for select
  to anon, authenticated
  using (approved = true);

drop function if exists public.submit_comment(text, text);

create function public.submit_comment(
  p_name text,
  p_content text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(p_name, ''));
  clean_content text := btrim(coalesce(p_content, ''));
  inserted_comment public.comments;
begin
  if char_length(clean_name) not between 1 and 30 then
    raise exception 'COMMENT_NAME_INVALID';
  end if;

  if char_length(clean_content) not between 1 and 300 then
    raise exception 'COMMENT_CONTENT_INVALID';
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

  insert into public.comments (name, content)
  values (clean_name, clean_content)
  returning * into inserted_comment;

  return jsonb_build_object(
    'id', inserted_comment.id,
    'name', inserted_comment.name,
    'content', inserted_comment.content,
    'created_at', inserted_comment.created_at
  );
end;
$$;

revoke all on function public.submit_comment(text, text) from public;
grant execute on function public.submit_comment(text, text)
  to anon, authenticated;
