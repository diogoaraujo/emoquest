import { useCallback, useEffect, useState } from 'react'
import { EmotionAvatar } from '../components/EmotionAvatar'
import { EmotionModal } from '../components/EmotionDetail'
import { btnBrand } from '../components/ui'
import { EMOTIONS } from '../data/emotions'
import type { EmotionId } from '../types'

type PrintTarget = EmotionId | 'todos'

export function Characters() {
  const [selected, setSelected] = useState<EmotionId | null>(null)
  const [outline, setOutline] = useState(false)
  const [printTarget, setPrintTarget] = useState<PrintTarget | null>(null)
  const closeModal = useCallback(() => setSelected(null), [])
  const printOne = useCallback((id: EmotionId) => {
    setSelected(null)
    setPrintTarget(id)
  }, [])

  // Espera o React aplicar a seleção de impressão antes de abrir a janela do navegador.
  useEffect(() => {
    if (!printTarget) return
    const t = setTimeout(() => {
      window.print()
      setPrintTarget(null)
    }, 80)
    return () => clearTimeout(t)
  }, [printTarget])

  const hiddenInPrint = (id: EmotionId) => printTarget !== null && printTarget !== 'todos' && printTarget !== id

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-8 md:py-10 print:max-w-none print:p-0">
      <div className="print:hidden">
        <h1 className="font-display text-[2rem] leading-tight font-extrabold sm:text-4xl">Personagens</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink/75">
          Conheça a turma que mora aí dentro. Toque em um personagem para saber mais ou imprima os cards — coloridos ou para colorir.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 rounded-full bg-white p-1 ring-1 ring-ink/10" role="group" aria-label="Estilo dos cards">
            <button
              onClick={() => setOutline(false)}
              aria-pressed={!outline}
              className={`min-h-12 rounded-full px-4 font-bold transition ${!outline ? 'bg-ink text-white' : 'hover:bg-ink/5'}`}
            >
              🎨 Colorido
            </button>
            <button
              onClick={() => setOutline(true)}
              aria-pressed={outline}
              className={`min-h-12 rounded-full px-4 font-bold transition ${outline ? 'bg-ink text-white' : 'hover:bg-ink/5'}`}
            >
              ✏️ Para colorir
            </button>
          </div>
          <button onClick={() => setPrintTarget('todos')} className={btnBrand}>
            🖨️ Imprimir todos
          </button>
        </div>
      </div>

      <h1 className="mb-4 hidden text-center font-display text-2xl font-extrabold print:block">EmoQuest — Personagens das emoções</h1>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 print:mt-0 print:grid-cols-2 print:gap-4">
        {EMOTIONS.map((e, i) => (
          <li
            key={e.id}
            className={`flex animate-pop flex-col rounded-3xl p-3 ring-1 ring-ink/10 break-inside-avoid sm:p-5 print:rounded-2xl print:p-5 print:ring-2 ${
              hiddenInPrint(e.id) ? 'print:hidden' : ''
            } ${printTarget === e.id ? 'print:col-span-2' : ''}`}
            style={{ background: outline ? '#fff' : e.corSuave, animationDelay: `${i * 0.04}s` }}
          >
            <button
              onClick={() => setSelected(e.id)}
              className="group flex flex-col items-center rounded-2xl text-center transition active:scale-95"
              aria-label={`Ver detalhes de ${e.personagem}, ${e.nome}`}
            >
              <span
                className={`block aspect-square w-full transition md:group-hover:scale-105 ${printTarget === e.id ? 'max-w-[320px]' : 'max-w-[150px]'}`}
              >
                <EmotionAvatar id={e.id} outline={outline} size="100%" />
              </span>
              <span className="font-display text-xl font-extrabold sm:text-2xl" style={{ color: outline ? undefined : e.corForte }}>
                {e.personagem}
              </span>
              <span className="font-bold text-ink/75">{e.nome}</span>
              <span className="mt-2 hidden italic sm:block print:block">“{e.frase}”</span>
            </button>
            <p className="mt-3 hidden flex-1 text-ink/75 sm:block print:block">{e.funcao}</p>
            <div className="mt-4 hidden gap-2 sm:flex print:hidden">
              <button onClick={() => setSelected(e.id)} className="min-h-12 flex-1 rounded-full bg-white px-4 font-bold ring-1 ring-ink/10 hover:bg-ink/5">
                Saber mais
              </button>
              <button
                onClick={() => printOne(e.id)}
                className="min-h-12 min-w-12 rounded-full bg-white px-4 font-bold ring-1 ring-ink/10 hover:bg-ink/5"
                aria-label={`Imprimir ${e.personagem}`}
              >
                🖨️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selected && <EmotionModal id={selected} onClose={closeModal} onPrint={printOne} />}
    </div>
  )
}
