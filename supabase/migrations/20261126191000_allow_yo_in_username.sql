alter table public.profiles drop constraint profiles_username_format;

alter table public.profiles add constraint profiles_username_format check (
  char_length(username) between 3 and 30
  and username ~ '^[A-Za-zА-Яа-яЁё0-9_]+$'
);

create or replace function public.is_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate is not null
    and char_length(trim(candidate)) between 3 and 30
    and trim(candidate) ~ '^[A-Za-zА-Яа-яЁё0-9_]+$'
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(trim(candidate))
    );
$$;

comment on function public.is_username_available(text) is
  'Проверка имени до регистрации. Возвращает только да или нет, без данных профиля. Вызов до входа нужен форме регистрации.';
