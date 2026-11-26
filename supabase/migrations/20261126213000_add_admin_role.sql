alter table public.profiles
  add column role text not null default 'user';

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

comment on column public.profiles.role is 'user — обычный кабинет, admin — полный доступ к профилям.';

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'true только для текущего вошедшего администратора. Чужие данные не возвращает.';

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.id = old.id;
    new.email = old.email;
    new.created_at = old.created_at;

    if new.role is distinct from old.role and not public.is_admin() then
      new.role = old.role;
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create policy profiles_admin_select
  on public.profiles
  for select
  to authenticated
  using ((select public.is_admin()));

create policy profiles_admin_update
  on public.profiles
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy profiles_admin_delete
  on public.profiles
  for delete
  to authenticated
  using ((select public.is_admin()));
