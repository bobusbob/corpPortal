import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { defaultSectionId } from '../sections/registry'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!username.trim() || !password) {
      setFormError('Введите имя пользователя и пароль.')
      return
    }

    setPending(true)
    const error = await login({ username, password })
    setPending(false)

    if (error) {
      setFormError(error)
      return
    }

    navigate(`/cabinet/${defaultSectionId}`, { replace: true })
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <Link className="brand" to="/">
          Портал
        </Link>
        <h1>Вход</h1>
        <p className="lead">Вход по имени пользователя и паролю, которые вы указали при регистрации.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Имя пользователя
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            Пароль
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <button className="button" type="submit" disabled={pending}>
            {pending ? 'Входим…' : 'Войти'}
          </button>
        </form>
        <p className="switch">
          Нет кабинета? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </section>
    </main>
  )
}
