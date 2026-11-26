import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from './components/RequireAuth'
import { CabinetPage } from './pages/CabinetPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { defaultSectionId } from './sections/registry'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/cabinet"
        element={
          <RequireAuth>
            <Navigate to={`/cabinet/${defaultSectionId}`} replace />
          </RequireAuth>
        }
      />
      <Route
        path="/cabinet/:sectionId"
        element={
          <RequireAuth>
            <CabinetPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
