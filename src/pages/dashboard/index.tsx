import { fetchAccount } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatDateTime } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { ROUTES } from '@/routes/paths'
import type { Transaction } from '@/types/bank'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function transactionLabel(t: Transaction) {
  const sign = t.amount >= 0 ? '+' : ''
  return `${sign}${formatBRL(t.amount)}`
}

function transactionAmountClass(t: Transaction) {
  const isOut = t.type === 'debit' || t.amount < 0
  return isOut
    ? 'text-sm font-semibold text-destructive'
    : 'text-sm font-semibold text-primary'
}

export function DashboardPage() {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.account,
    queryFn: fetchAccount,
  })

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Carregando sua conta…
      </p>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Não foi possível carregar</CardTitle>
          <CardDescription>Tente atualizar a página.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumo</h1>
          <p className="text-sm text-muted-foreground">Saldo e movimentações recentes:</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to={ROUTES.transfer} className="gap-2">
            <ArrowLeftRight className="size-4" aria-hidden />
            Nova transferência
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="bg-primary/10">
          <CardDescription>Saldo disponível</CardDescription>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {formatBRL(data.balance)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Transações</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={isRefetching}
              onClick={() => refetch()}
            >
              {isRefetching ? 'Atualizando…' : 'Atualizar'}
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-md border border-border">
            {data.transactions.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                </div>
                <p className={transactionAmountClass(t)}>{transactionLabel(t)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
