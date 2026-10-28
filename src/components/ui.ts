// Classes de botão compartilhadas: alvos de toque com no mínimo 56px de altura e largura total no celular.
const base =
  'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-7 text-lg font-extrabold transition active:scale-[0.97] sm:w-auto'

export const btnPrimary = `${base} bg-ink text-white shadow-lg shadow-ink/20 hover:-translate-y-0.5`
export const btnSecondary = `${base} border-2 border-ink bg-white/60 hover:bg-ink/5`
export const btnBrand = `${base} bg-brand text-white shadow-lg shadow-brand/25 hover:-translate-y-0.5`

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pequena vibração de confirmação em celulares compatíveis. */
export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* sem suporte */
  }
}
