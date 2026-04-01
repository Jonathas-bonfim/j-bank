import { Navigate, Outlet } from 'react-router-dom'
import { useAuthHydrated } from '@/hooks/use-auth-hydrated'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth-store'

export function ProtectedLayout() {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((s) => s.token)

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando sessão…
      </div>
    )
  }

  if (!token) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <Outlet />
}
