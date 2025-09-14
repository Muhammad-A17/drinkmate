import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'

interface CurrencyProps {
  amount: number
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Currency({ amount, className = '', size = 'sm' }: CurrencyProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <SaudiRiyalSymbol size={size} className="text-ink-700" />
      <span className="tabular-nums">{amount.toFixed(2)}</span>
    </span>
  )
}
