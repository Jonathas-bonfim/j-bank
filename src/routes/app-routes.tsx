import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/app-layout'
import { ProtectedLayout } from '@/components/protected-layout'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { TransferPage } from '@/pages/transfer'
import { ROUTES } from '@/routes/paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.transfer} element={<TransferPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
    </Routes>
  )
}
