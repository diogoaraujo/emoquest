import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">
        {label}
      </label>
      <input
        id={id}
        {...props}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="min-h-14 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 text-lg transition outline-none focus:border-brand"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink/70">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink/10">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-[#6a45f5]" />
      <span className="text-base">{children}</span>
    </label>
  )
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'ok'; children: ReactNode }) {
  const styles = {
    error: 'bg-[#FFE4DC] text-[#8C2410]',
    info: 'bg-[#E3ECFF] text-[#1E3F8A]',
    ok: 'bg-[#E6F7DA] text-[#2F6B12]',
  }[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl px-4 py-3 font-bold ${styles}`}>
      {children}
    </div>
  )
}

export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          {title && <h2 className="font-display text-xl leading-tight font-extrabold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 font-bold text-ink/70" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-4 border-ink/15 border-t-brand" aria-hidden />
      {label}
    </div>
  )
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
