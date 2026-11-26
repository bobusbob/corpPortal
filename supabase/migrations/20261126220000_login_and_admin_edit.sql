create function public.email_for_login(login_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email
  from public.profiles
  where login_name is not null
    and char_length(trim(login_name)) > 0
    and lower(username) = lower(trim(login_name))
  limit 1;
$$;

comment on function public.email_for_login(text) is
  'Возвращает почту по имени пользователя, чтобы войти паролем. Другие поля не отдаёт.';

revoke all on function public.email_for_login(text) from public;
grant execute on function public.email_for_login(text) to anon, authenticated;

create function public.admin_update_profile(
  target_id uuid,
  new_full_name text,
  new_email text,
  new_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_role text;
  profile_email text;
  admin_count integer;
  clean_name text;
  clean_email text;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  clean_name := trim(new_full_name);
  clean_email := lower(trim(new_email));

  if clean_name is null or char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'invalid name';
  end if;

  if clean_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'invalid email';
  end if;

  if new_role not in ('user', 'admin') then
    raise exception 'invalid role';
  end if;

  select profiles.role, profiles.email
    into profile_role, profile_email
  from public.profiles
  where profiles.id = target_id;

  if not found then
    raise exception 'profile not found';
  end if;

  if profile_role = 'admin' and new_role <> 'admin' then
    select count(*)
      into admin_count
    from public.profiles
    where profiles.role = 'admin'
      and profiles.id <> target_id;

    if admin_count = 0 then
      raise exception 'last admin';
    end if;
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(profiles.email) = clean_email
      and profiles.id <> target_id
  ) then
    raise exception 'email taken';
  end if;

  if lower(profile_email) is distinct from clean_email then
    update auth.users
      set email = clean_email
      where id = target_id;

    update auth.identities
      set identity_data = jsonb_set(identity_data, '{email}', to_jsonb(clean_email), true)
      where user_id = target_id
        and provider = 'email';
  end if;

  update public.profiles
    set full_name = clean_name,
        email = clean_email,
        role = new_role
    where id = target_id;
end;
$$;

comment on function public.admin_update_profile(uuid, text, text, text) is
  'Администратор меняет имя, почту и роль. Имя пользователя и дату регистрации функция не принимает.';

revoke all on function public.admin_update_profile(uuid, text, text, text) from public, anon;
grant execute on function public.admin_update_profile(uuid, text, text, text) to authenticated;
