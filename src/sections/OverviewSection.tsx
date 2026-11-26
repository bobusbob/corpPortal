import { useAuth } from '../auth/auth-context'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(date)
}

export function OverviewSection() {
  const { profile, profileError } = useAuth()

  if (!profile) {
    return <p className="status">{profileError ?? 'Загружаем профиль…'}</p>
  }

  return (
    <div className="section">
      <p className="eyebrow">Личный кабинет</p>
      <h1>{profile.full_name}</h1>
      <p className="lead">
        Регистрация сохранена. Следующие учебные задания будут появляться здесь отдельными вкладками.
      </p>

      <dl className="profile">
        <div>
          <dt>Роль</dt>
          <dd>{profile.role === 'admin' ? 'Администратор' : 'Пользователь'}</dd>
        </div>
        <div>
          <dt>Имя пользователя</dt>
          <dd>{profile.username}</dd>
        </div>
        <div>
          <dt>Почта</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Регистрация</dt>
          <dd>{formatDate(profile.created_at)}</dd>
        </div>
      </dl>
    </div>
  )
}
