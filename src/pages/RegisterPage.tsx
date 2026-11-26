import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { defaultSectionId } from '../sections/registry'

const usernamePattern = /^[A-Za-zА-Яа-яЁё0-9_]{3,30}$/u
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldName = 'fullName' | 'username' | 'email' | 'password' | 'confirm'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Partial<Record<FieldName, string>> = {}
    const name = fullName.trim()
    const login = username.trim()

    if (name.length < 2 || name.length > 80) {
      nextErrors.fullName = 'Имя должно быть от 2 до 80 символов.'
    }
    if (!usernamePattern.test(login)) {
      nextErrors.username = 'От 3 до 30 символов: буквы, цифры и знак подчёркивания.'
    }
    if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Укажите почту в обычном виде.'
    }
    if (password.length < 8) {
      nextErrors.password = 'Пароль должен быть не короче 8 символов.'
    }
    if (password !== confirm) {
      nextErrors.confirm = 'Пароли не совпадают.'
    }

    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) return

    setPending(true)
    const result = await register({
      fullName: name,
      username: login,
      email: email.trim(),
      password,
    })
    setPending(false)

    if (result.status === 'signed-in') {
      navigate(`/cabinet/${defaultSectionId}`, { replace: true })
      return
    }

    if (result.status === 'confirm-email') {
      setConfirmEmail(true)
      return
    }

    if (result.field) {
      setErrors({ [result.field]: result.message })
      return
    }
    setFormError(result.message)
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <Link className="brand" to="/">
          Портал
        </Link>
        <h1>Регистрация</h1>
        <p className="lead">Кабинет создаётся в базе Supabase. Пароль туда не записывается открытым текстом.</p>

        {confirmEmail ? (
          <div className="notice" role="status">
            <strong>Проверьте почту</strong>
            <p>
              На {email.trim()} отправлено письмо для подтверждения. После перехода по ссылке можно войти в
              кабинет.
            </p>
            <Link className="button" to="/login">
              Перейти ко входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Имя
              <input
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </label>
            <label>
              Имя пользователя
              <input
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </label>
            <label>
              Почта
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
            <label>
              Пароль
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>
            <label>
              Пароль ещё раз
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </label>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button className="button" type="submit" disabled={pending}>
              {pending ? 'Создаём кабинет…' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        <p className="switch">
          Уже есть кабинет? <Link to="/login">Войти</Link>
        </p>
      </section>
    </main>
  )
}
