import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'
import { z } from 'zod'
import { fetchAccount, transferRequest } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatAmountInputDigits, parseMaskedBRLToNumber } from '@/lib/brl-input-mask'
import { formatBRL } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

function buildTransferSchema(balance: number) {
  return z
    .object({
      recipientName: z
        .string()
        .min(2, 'Informe o nome do favorecido')
        .max(120, 'Nome muito longo'),
      amount: z.string().min(1, 'Informe o valor'),
      note: z.union([z.string().max(140, 'Máximo 140 caracteres'), z.literal('')]),
    })
    .superRefine((data, ctx) => {
      const n = parseMaskedBRLToNumber(data.amount)
      if (Number.isNaN(n)) {
        ctx.addIssue({ code: 'custom', path: ['amount'], message: 'Use um número válido' })
        return
      }
      if (n <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: 'O valor deve ser maior que zero',
        })
        return
      }
      if (n > balance) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: 'Saldo insuficiente para esta transferência',
        })
      }
    })
}

type TransferFormValues = z.infer<ReturnType<typeof buildTransferSchema>>

export function TransferPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: account, isPending } = useQuery({
    queryKey: queryKeys.account,
    queryFn: fetchAccount,
  })

  const balance = account?.balance ?? 0
  const schema = useMemo(() => buildTransferSchema(balance), [balance])
  const resolver = useMemo(() => zodResolver(schema), [schema])

  const form = useForm<TransferFormValues>({
    resolver,
    defaultValues: { recipientName: '', amount: '', note: '' },
  })

  useEffect(() => {
    form.clearErrors('amount')
  }, [balance, form])

  const transferMutation = useMutation({
    mutationFn: transferRequest,
    onSuccess: (snapshot) => {
      queryClient.setQueryData(queryKeys.account, snapshot)
      form.reset({ recipientName: '', amount: '', note: '' })
      navigate(ROUTES.dashboard, { replace: true })
    },
  })

  if (isPending || !account) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Carregando saldo…
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transferência</h1>
        <p className="text-sm text-muted-foreground">
          Saldo atual:{' '}
          <span className="font-medium text-foreground">{formatBRL(account.balance)}</span>
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Enviar valor</CardTitle>
          <CardDescription>
            Preencha os dados. O saldo e o extrato são atualizados na hora (simulação via Axios).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              const n = parseMaskedBRLToNumber(values.amount)
              transferMutation.mutate({
                recipientName: values.recipientName,
                amount: n,
                note: values.note.trim() ? values.note : undefined,
              })
            })}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="recipientName">
                Favorecido{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="recipientName"
                placeholder="Nome completo"
                aria-invalid={Boolean(form.formState.errors.recipientName)}
                aria-required="true"
                {...form.register('recipientName')}
              />
              {form.formState.errors.recipientName ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.recipientName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                Valor (BRL){' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Controller
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="amount"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0,00"
                    aria-invalid={Boolean(form.formState.errors.amount)}
                    aria-required="true"
                    value={field.value}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '')
                      field.onChange(digits === '' ? '' : formatAmountInputDigits(digits))
                    }}
                  />
                )}
              />
              {form.formState.errors.amount ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.amount.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Observação (opcional)</Label>
              <Input id="note" placeholder="Ex.: Pagamento fornecedor" {...form.register('note')} />
              {form.formState.errors.note ? (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.note.message}
                </p>
              ) : null}
            </div>
            {transferMutation.isError ? (
              <p className="text-sm text-destructive" role="alert">
                Não foi possível concluir. Verifique o valor e tente novamente.
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={transferMutation.isPending}>
                {transferMutation.isPending ? 'Processando…' : 'Confirmar transferência'}
              </Button>
              <Button variant="outline" type="button" asChild>
                <Link to={ROUTES.dashboard}>Voltar ao resumo</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
