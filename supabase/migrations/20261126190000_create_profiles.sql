-- Профиль пользователя портала.
-- Пароль хранится только в auth.users и в эту таблицу не копируется.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint profiles_username_format check (
    char_length(username) between 3 and 30
    and username ~ '^[A-Za-zА-Яа-яЁ0-9_]+$'
  ),
  constraint profiles_full_name_length check (char_length(full_name) between 2 and 80),
  constraint profiles_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 500)
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));
create unique index profiles_email_lower_idx on public.profiles (lower(email));

comment on table public.profiles is 'Профиль пользователя корпоративного портала. Создаётся автоматически при регистрации.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.id = old.id;
    new.email = old.email;
    new.created_at = old.created_at;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_before_update
  before update on public.profiles
  for each row
  execute function public.profiles_before_update();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_username text;
  chosen_name text;
begin
  chosen_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  chosen_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');

  if chosen_username is null then
    raise exception 'username is required';
  end if;

  if chosen_name is null then
    raise exception 'full_name is required';
  end if;

  insert into public.profiles (id, email, username, full_name)
  values (new.id, new.email, chosen_username, chosen_name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
      set email = new.email
      where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  execute function public.handle_user_email_change();

create function public.is_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate is not null
    and char_length(trim(candidate)) between 3 and 30
    and trim(candidate) ~ '^[A-Za-zА-Яа-яЁ0-9_]+$'
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(trim(candidate))
    );
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;
revoke all on function public.profiles_before_update() from public, anon, authenticated;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
