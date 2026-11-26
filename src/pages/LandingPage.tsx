import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { defaultSectionId } from '../sections/registry'

export function LandingPage() {
  const { ready, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const confirming = params.has('code') || window.location.hash.includes('access_token')
    if (ready && profile && confirming) {
      navigate(`/cabinet/${defaultSectionId}`, { replace: true })
    }
  }, [navigate, profile, ready])

  return (
    <main className="landing">
      <header className="topbar">
        <span className="brand">Портал</span>
        {profile ? (
          <Link className="button" to={`/cabinet/${defaultSectionId}`}>
            Открыть кабинет
          </Link>
        ) : (
          <Link className="text-link" to="/login">
            Вход
          </Link>
        )}
      </header>

      <section className="landing-grid">
        <div>
          <p className="eyebrow">Учебный корпоративный портал</p>
          <h1>Сначала личный кабинет, затем разделы курсов</h1>
          <p className="lead">
            Чтобы открыть портал, нужно зарегистрироваться. После входа доступен кабинет, а каждое
            выполненное задание курса станет отдельной вкладкой.
          </p>
          <div className="actions">
            <Link className="button" to={profile ? `/cabinet/${defaultSectionId}` : '/register'}>
              {profile ? 'Перейти в кабинет' : 'Регистрация'}
            </Link>
            {!profile && (
              <Link className="button button-ghost" to="/login">
                Уже есть кабинет
              </Link>
            )}
          </div>
        </div>

        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <strong>Регистрация</strong>
              <p>Почта, имя и имя пользователя сохраняются в Supabase. Пароль остаётся в Auth.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Личный кабинет</strong>
              <p>После входа открываются разделы. Без регистрации их не видно.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Вкладка курса</strong>
              <p>Новый учебный проект добавляется как ещё одна вкладка кабинета.</p>
            </div>
          </li>
        </ol>
      </section>
    </main>
  )
}
