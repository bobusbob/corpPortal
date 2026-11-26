import { useEffect, useState } from 'react'
import { translateAdminEditError } from '../auth/messages'
import { useAuth } from '../auth/auth-context'
import type { Profile, ProfileRole } from '../lib/database'
import { supabase } from '../lib/supabase'

const columns = 'id, email, username, full_name, avatar_url, role, created_at'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date)
}

function UserRow({
  row,
  onSaved,
}: {
  row: Profile
  onSaved: (next: Profile) => void
}) {
  const [fullName, setFullName] = useState(row.full_name)
  const [email, setEmail] = useState(row.email)
  const [role, setRole] = useState<ProfileRole>(row.role)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const dirty = fullName !== row.full_name || email !== row.email || role !== row.role

  useEffect(() => {
    setFullName(row.full_name)
    setEmail(row.email)
    setRole(row.role)
  }, [row.email, row.full_name, row.role])

  async function save() {
    setPending(true)
    setMessage(null)
    setFailed(false)

    const { error } = await supabase.rpc('admin_update_profile', {
      target_id: row.id,
      new_full_name: fullName.trim(),
      new_email: email.trim(),
      new_role: role,
    })

    setPending(false)

    if (error) {
      setFailed(true)
      setMessage(translateAdminEditError(error.message))
      return
    }

    const next = { ...row, full_name: fullName.trim(), email: email.trim().toLowerCase(), role }
    onSaved(next)
    setMessage('Сохранено')
  }

  return (
    <tr>
      <td>
        <input
          aria-label={`Имя, ${row.username}`}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </td>
      <td>{row.username}</td>
      <td>
        <input
          aria-label={`Почта, ${row.username}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </td>
      <td>
        <select
          aria-label={`Роль, ${row.username}`}
          value={role}
          onChange={(event) => setRole(event.target.value as ProfileRole)}
        >
          <option value="user">Пользователь</option>
          <option value="admin">Администратор</option>
        </select>
      </td>
      <td>{formatDate(row.created_at)}</td>
      <td>
        <button className="button button-small" type="button" disabled={!dirty || pending} onClick={() => void save()}>
          {pending ? 'Сохраняем…' : 'Сохранить'}
        </button>
        {message && <span className={failed ? 'field-error' : 'save-note'}>{message}</span>}
      </td>
    </tr>
  )
}

export function UsersSection() {
  const { profile, refreshProfile } = useAuth()
  const [rows, setRows] = useState<Profile[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    void supabase
      .from('profiles')
      .select(columns)
      .order('created_at', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (ignore) return
        if (queryError) {
          setError('Не удалось загрузить список пользователей.')
          setRows([])
          return
        }
        setRows(data ?? [])
      })

    return () => {
      ignore = true
    }
  }, [])

  function handleSaved(next: Profile) {
    setRows((current) => current?.map((item) => (item.id === next.id ? next : item)) ?? null)
    if (profile?.id === next.id) {
      void refreshProfile()
    }
  }

  if (!rows) {
    return <p className="status">Загружаем пользователей…</p>
  }

  return (
    <div className="section">
      <p className="eyebrow">Администрирование</p>
      <h1>Пользователи</h1>
      <p className="lead">
        Можно менять имя, почту и роль. Имя пользователя и дата регистрации не редактируются.
      </p>
      {error && <p className="form-error">{error}</p>}
      <div className="table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Пользователь</th>
              <th>Почта</th>
              <th>Роль</th>
              <th>Регистрация</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <UserRow key={row.id} row={row} onSaved={handleSaved} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
