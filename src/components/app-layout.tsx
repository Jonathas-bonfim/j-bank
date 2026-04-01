import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { ArrowLeftRight, LayoutDashboard, LogOut } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const nav = [
  { to: ROUTES.dashboard, label: 'Início', icon: LayoutDashboard },
  { to: ROUTES.transfer, label: 'Transferir', icon: ArrowLeftRight },
]

export function AppLayout() {
  const location = useLocation()
  const clearSession = useAuthStore((s) => s.clearSession)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground"
              aria-hidden
            >
              J
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold tracking-tight">J Bank</p>
              <p className="text-xs text-muted-foreground">Facilitando suas transações</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Principal">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Button key={to} variant={active ? 'default' : 'outline'} size="sm" asChild>
                  <Link to={to} className="gap-2">
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </Button>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              className={cn('gap-2 text-muted-foreground')}
              type="button"
              onClick={() => clearSession()}
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </Button>
          </nav>
        </div>
        {user ? (
          <p className="mx-auto max-w-3xl px-4 pb-3 text-left text-xs text-muted-foreground">
            Conectado como <span className="font-medium text-foreground">{user.email}</span>
          </p>
        ) : null}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
