const brlTwoDecimals = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Extrai apenas dígitos da digitação e formata como moeda BRL (milhar com `.`, decimais com `,`, 2 casas).
 * Os dígitos são interpretados como centavos (ex.: "1" → "0,01"; "1234" → "12,34").
 */
export function formatAmountInputDigits(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (!d) return ''
  const cents = Math.min(Number.parseInt(d, 10), Number.MAX_SAFE_INTEGER)
  if (!Number.isFinite(cents) || cents < 0) return ''
  return brlTwoDecimals.format(cents / 100)
}

/** Converte valor mascarado (pt-BR) em número para validação e API. */
export function parseMaskedBRLToNumber(masked: string): number {
  const trimmed = masked.trim()
  if (!trimmed) return Number.NaN
  const noThousands = trimmed.replace(/\./g, '')
  const withDotDecimal = noThousands.replace(',', '.')
  return Number(withDotDecimal)
}
