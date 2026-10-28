import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { getEmotion } from '../data/emotions'
import type { EmotionId } from '../types'
import { EmotionAvatar } from './EmotionAvatar'
import { btnSecondary } from './ui'

/** Conteúdo educativo completo de uma emoção. */
export function EmotionInfo({ id }: { id: EmotionId }) {
  const e = getEmotion(id)
  return (
    <div className="space-y-4 text-left text-[1.0625rem] leading-relaxed">
      <p>{e.descricao}</p>
      <Section title="Para que ela serve?" color={e.corForte}>
        <p>{e.funcao}</p>
      </Section>
      <Section title="Como ela aparece" color={e.corForte}>
        <List items={e.sinais} />
      </Section>
      <Section title="Quando fica muito intensa" color={e.corForte}>
        <p>{e.intensa}</p>
      </Section>
      <Section title="Como acolher" color={e.corForte}>
        <List items={e.acolher} />
      </Section>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-xl font-bold" style={{ color }}>
        {title}
      </h4>
      {children}
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  )
}

interface ModalProps {
  id: EmotionId
  onClose: () => void
  onPrint?: (id: EmotionId) => void
}

/** Bottom sheet no celular (arraste para baixo para fechar), janela centralizada em telas maiores. */
export function EmotionModal({ id, onClose, onPrint }: ModalProps) {
  const e = getEmotion(id)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dragStart = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus({ preventScroll: true })
    }
  }, [onClose])

  const onTouchStart = (ev: TouchEvent) => {
    dragStart.current = ev.touches[0].clientY
  }
  const onTouchMove = (ev: TouchEvent) => {
    if (dragStart.current !== null) setDragY(Math.max(0, ev.touches[0].clientY - dragStart.current))
  }
  const onTouchEnd = () => {
    if (dragY > 100) onClose()
    else setDragY(0)
    dragStart.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-ink/50 sm:items-center sm:p-4 print:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emotion-modal-title"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg animate-sheet flex-col overflow-hidden rounded-t-[2rem] bg-white sm:animate-pop sm:rounded-3xl"
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragStart.current === null ? 'transform .2s' : 'none' }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div
          className="relative flex shrink-0 flex-col items-center px-6 pt-3 pb-4 text-center"
          style={{ background: e.corSuave }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <span className="mb-2 h-1.5 w-12 rounded-full bg-ink/25 sm:hidden" aria-hidden />
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-xl font-bold transition hover:bg-white active:scale-95"
            aria-label="Fechar"
          >
            ✕
          </button>
          <EmotionAvatar id={id} size={130} animated />
          <h3 id="emotion-modal-title" className="font-display text-3xl font-extrabold" style={{ color: e.corForte }}>
            {e.personagem}
          </h3>
          <p className="font-bold text-ink/75">{e.nome}</p>
          <p className="mt-1 text-lg italic">“{e.frase}”</p>
        </div>
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
          <EmotionInfo id={id} />
          {onPrint && (
            <button onClick={() => onPrint(id)} className={`${btnSecondary} mt-6`}>
              🖨️ Imprimir {e.personagem}
            </button>
          )}
          <div className="h-[env(safe-area-inset-bottom)]" aria-hidden />
        </div>
      </div>
    </div>
  )
}
