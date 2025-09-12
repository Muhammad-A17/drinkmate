interface StatPillProps {
  icon: string
  label: string
  value: string
  className?: string
}

export default function StatPill({ icon, label, value, className = "" }: StatPillProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className="text-lg mb-1" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs font-medium text-black/70 leading-tight">
        {label}
      </span>
      <span className="text-xs font-semibold text-black leading-tight">
        {value}
      </span>
    </div>
  )
}
