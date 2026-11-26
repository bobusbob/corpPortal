import { NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { defaultSectionId, sections } from '../sections/registry'

export function CabinetPage() {
  const { sectionId } = useParams()
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const visibleSections = sections.filter((item) => !item.adminOnly || profile?.role === 'admin')
  const section = visibleSections.find((item) => item.id === sectionId)

  if (!section) {
    return <Navigate to={`/cabinet/${defaultSectionId}`} replace />
  }

  const ActiveSection = section.Component

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="cabinet">
      <aside className="rail">
        <div>
          <span className="brand">Портал</span>
          <p className="rail-user">
            {profile?.full_name}
            {profile?.role === 'admin' ? ' · администратор' : ''}
          </p>
        </div>
        <nav className="section-nav" aria-label="Разделы">
          {visibleSections.map((item) => (
            <NavLink key={item.id} to={`/cabinet/${item.id}`} end>
              <span>{item.title}</span>
              <small>{item.course}</small>
            </NavLink>
          ))}
        </nav>
        <button className="button button-ghost" type="button" onClick={() => void handleLogout()}>
          Выйти
        </button>
      </aside>
      <section className="canvas">
        <ActiveSection />
      </section>
    </div>
  )
}
