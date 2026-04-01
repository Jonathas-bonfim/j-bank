import { loginRequest } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthHydrated } from '@/hooks/use-auth-hydrated'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((s) => s.token)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: (values: LoginForm) => loginRequest(values.email, values.password),
    onSuccess: (data) => {
      setSession(data.token, data.user)
      navigate(ROUTES.dashboard, { replace: true })
    },
  })

  if (hydrated && token) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando…
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground"
          aria-hidden
        >
          J
        </div>
        <div className="text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">J Bank</h1>
          <p className="text-sm text-muted-foreground">
            Converta, pague e transfira globalmente em cripto e fiat.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                E-mail{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="voce@exemplo.com"
                aria-invalid={Boolean(errors.email)}
                aria-required="true"
                {...register('email')}
              />
              {errors.email ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Senha{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                aria-required="true"
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-destructive" role="alert">
                Não foi possível entrar. Tente novamente.
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        Oferecemos transferências de dinheiro globais rápidas e seguras
      </p>
    </div>
  )
}
