export function translateAuthError(message: string): { text: string; field?: 'username' | 'email' | 'password' } {
  const text = message.toLowerCase()

  if (
    text.includes('already registered') ||
    text.includes('already been registered') ||
    text.includes('user already')
  ) {
    return { text: 'Такая почта уже зарегистрирована. Войдите в кабинет.', field: 'email' }
  }

  if (text.includes('username') && (text.includes('duplicate') || text.includes('unique') || text.includes('taken'))) {
    return { text: 'Это имя пользователя уже занято.', field: 'username' }
  }

  if (text.includes('profiles_username') || text.includes('duplicate key')) {
    return { text: 'Это имя пользователя уже занято.', field: 'username' }
  }

  if (text.includes('password')) {
    return { text: 'Пароль не подходит. Нужно не меньше 8 символов.', field: 'password' }
  }

  if (text.includes('email') && (text.includes('invalid') || text.includes('unable to validate'))) {
    return {
      text: 'Этот адрес почты не принимается. Укажите обычную почту, не example.com.',
      field: 'email',
    }
  }

  if (text.includes('username is required') || text.includes('full_name is required')) {
    return { text: 'Заполните имя и имя пользователя.' }
  }

  if (text.includes('database error')) {
    return { text: 'Не удалось сохранить профиль. Проверьте имя пользователя и почту.' }
  }

  return { text: 'Не удалось выполнить запрос. Попробуйте ещё раз.' }
}

export function translateAdminEditError(message: string): string {
  const text = message.toLowerCase()

  if (text.includes('last admin')) {
    return 'Нельзя снять права с последнего администратора.'
  }
  if (text.includes('email taken')) {
    return 'Такая почта уже используется.'
  }
  if (text.includes('invalid email')) {
    return 'Укажите почту в обычном виде.'
  }
  if (text.includes('invalid name')) {
    return 'Имя должно быть от 2 до 80 символов.'
  }
  if (text.includes('invalid role')) {
    return 'Выберите роль из списка.'
  }
  if (text.includes('admin only')) {
    return 'Недостаточно прав.'
  }
  if (text.includes('profile not found')) {
    return 'Пользователь не найден.'
  }

  return 'Не удалось сохранить изменения.'
}
