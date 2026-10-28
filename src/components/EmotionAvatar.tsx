import type { ReactNode } from 'react'
import { getEmotion } from '../data/emotions'
import type { EmotionId } from '../types'

interface Props {
  id: EmotionId
  size?: number | string
  /** Contorno preto e preenchimento branco: versão "para colorir". */
  outline?: boolean
  animated?: boolean
  className?: string
}

const INK = '#2a2346'

function starPoints(cx: number, cy: number, rOut: number, rIn: number, n: number) {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? rIn : rOut
    const a = (Math.PI * i) / n - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** Personagens originais do EmoQuest, desenhados com formas geométricas simples. */
export function EmotionAvatar({ id, size = 120, outline = false, animated = false, className = '' }: Props) {
  const e = getEmotion(id)
  const fill = (c: string) => (outline ? '#fff' : c)
  const body = outline ? { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const } : {}
  const line = { stroke: INK, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' }

  let art: ReactNode
  switch (id) {
    case 'alegria':
      art = (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d="M100 10 L113 38 L87 38 Z" transform={`rotate(${i * 36} 100 102)`} fill={fill('#F5A800')} {...body} />
          ))}
          <circle cx="100" cy="102" r="62" fill={fill(e.cor)} {...body} />
          <circle cx="70" cy="116" r="9" fill={fill('#FF9E7A')} opacity={outline ? 1 : 0.6} {...body} />
          <circle cx="130" cy="116" r="9" fill={fill('#FF9E7A')} opacity={outline ? 1 : 0.6} {...body} />
          <path d="M72 96 Q80 84 88 96" {...line} />
          <path d="M112 96 Q120 84 128 96" {...line} />
          <path d="M78 114 Q100 146 122 114 Z" fill={outline ? '#fff' : '#7a2e00'} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M90 128 Q100 122 110 128 Q100 138 90 128 Z" fill={outline ? '#fff' : '#FF7A7A'} />
        </>
      )
      break
    case 'tristeza':
      art = (
        <>
          <path d="M100 22 C78 62 46 92 46 128 A54 54 0 0 0 154 128 C154 92 122 62 100 22 Z" fill={fill(e.cor)} {...body} />
          {!outline && <ellipse cx="74" cy="110" rx="9" ry="16" fill="#fff" opacity="0.35" transform="rotate(20 74 110)" />}
          <path d="M70 116 L90 108" {...line} />
          <path d="M130 116 L110 108" {...line} />
          <circle cx="82" cy="128" r="7" fill={INK} />
          <circle cx="118" cy="128" r="7" fill={INK} />
          <circle cx="84" cy="126" r="2.2" fill="#fff" />
          <circle cx="120" cy="126" r="2.2" fill="#fff" />
          <path d="M86 156 Q100 146 114 156" {...line} />
          <path d="M78 140 Q74 150 78 154 Q82 150 78 140 Z" fill={fill('#BFE0FF')} stroke={INK} strokeWidth="2" />
        </>
      )
      break
    case 'raiva':
      art = (
        <>
          <path
            d="M100 16 C112 48 142 58 150 94 C158 130 140 172 100 174 C60 172 42 128 52 98 C58 80 72 76 74 58 C86 70 90 80 88 92 C96 70 106 48 100 16 Z"
            fill={fill(e.cor)}
            {...body}
          />
          <path d="M100 78 C112 98 132 110 130 138 C128 158 116 166 100 166 C84 166 70 158 70 138 C70 116 90 110 100 78 Z" fill={fill('#FFA14A')} {...body} />
          <path d="M74 112 L94 122" {...line} />
          <path d="M126 112 L106 122" {...line} />
          <circle cx="86" cy="132" r="6" fill={INK} />
          <circle cx="114" cy="132" r="6" fill={INK} />
          <rect x="86" y="146" width="28" height="11" rx="3" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <path d="M95 146 V157 M105 146 V157" stroke={INK} strokeWidth="2.5" />
        </>
      )
      break
    case 'medo':
      art = (
        <>
          <path
            d="M48 168 L48 96 A52 52 0 0 1 152 96 L152 168 Q139 156 126 168 Q113 180 100 168 Q87 156 74 168 Q61 180 48 168 Z"
            fill={fill(e.cor)}
            {...body}
          />
          <path d="M66 76 Q80 66 92 74" {...line} />
          <path d="M108 74 Q120 66 134 76" {...line} />
          <circle cx="80" cy="100" r="16" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="120" cy="100" r="16" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="81" cy="102" r="4.5" fill={INK} />
          <circle cx="119" cy="102" r="4.5" fill={INK} />
          <path d="M82 138 Q91 130 100 138 Q109 146 118 138" {...line} />
          <path d="M40 120 L30 116 M40 132 L28 134 M160 120 L170 116 M160 132 L172 134" {...line} strokeWidth={3} />
        </>
      )
      break
    case 'nojinho':
      art = (
        <>
          <circle cx="38" cy="112" r="11" fill={fill(e.cor)} {...body} />
          <circle cx="162" cy="112" r="11" fill={fill(e.cor)} {...body} />
          <ellipse cx="100" cy="112" rx="62" ry="54" fill={fill(e.cor)} {...body} />
          <path d="M100 58 Q110 30 138 32 Q128 60 100 58 Z" fill={fill('#3E8E2E')} {...body} />
          <path d="M100 58 Q114 46 130 38" stroke={outline ? INK : '#2B6A1F'} strokeWidth="2.5" fill="none" />
          <path d="M68 94 L92 98" {...line} />
          <path d="M108 86 Q120 78 132 86" {...line} />
          <path d="M72 106 Q80 110 88 106" {...line} />
          <circle cx="120" cy="104" r="6.5" fill={INK} />
          <path d="M82 134 Q100 126 118 136" {...line} />
          <path d="M100 131 Q103 150 113 145 Q117 137 110 133 Z" fill={outline ? '#fff' : '#FF7FA8'} stroke={INK} strokeWidth="3" />
        </>
      )
      break
    case 'ansiedade':
      art = (
        <>
          <polygon points={starPoints(100, 108, 72, 58, 14)} fill={fill(e.cor)} {...body} />
          <circle cx="82" cy="100" r="15" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="118" cy="100" r="15" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="86" cy="96" r="5" fill={INK} />
          <circle cx="114" cy="104" r="5" fill={INK} />
          <path d="M68 80 L92 76 M108 76 L132 80" {...line} />
          <path d="M78 134 L86 128 L94 134 L102 128 L110 134 L118 128 L124 133" {...line} strokeWidth={4} strokeLinejoin="round" />
          <path d="M152 52 Q144 66 152 70 Q160 66 152 52 Z" fill={fill('#9ED8FF')} stroke={INK} strokeWidth="2.5" />
        </>
      )
      break
    case 'inveja':
      art = (
        <>
          <polygon points="100,26 160,60 160,140 100,174 40,140 40,60" fill={fill(e.cor)} {...body} />
          {!outline && <polygon points="100,26 160,60 100,78 40,60" fill="#fff" opacity="0.3" />}
          <path d="M100 26 L100 78 M40 60 L100 78 L160 60" stroke={outline ? INK : '#1A9C90'} strokeWidth="2.5" fill="none" />
          <ellipse cx="80" cy="112" rx="13" ry="10" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="120" cy="112" rx="13" ry="10" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx="88" cy="114" r="5" fill={INK} />
          <circle cx="128" cy="114" r="5" fill={INK} />
          <path d="M66 104 Q80 100 94 104 M106 104 Q120 100 134 104" {...line} />
          <path d="M90 146 Q100 138 112 144" {...line} />
        </>
      )
      break
    case 'vergonha':
      art = (
        <>
          <path d="M80 26 q6 -8 0 -16 M100 24 q6 -8 0 -16 M120 26 q6 -8 0 -16" {...line} strokeWidth={3} opacity={0.6} />
          <path d="M100 36 C150 36 162 68 162 112 C162 156 140 174 100 174 C60 174 38 156 38 112 C38 68 50 36 100 36 Z" fill={fill(e.cor)} {...body} />
          <ellipse cx="68" cy="122" rx="15" ry="9" fill={fill('#FF3D7F')} opacity={outline ? 1 : 0.55} {...body} />
          <ellipse cx="132" cy="122" rx="15" ry="9" fill={fill('#FF3D7F')} opacity={outline ? 1 : 0.55} {...body} />
          <path d="M72 104 Q81 112 90 104" {...line} />
          <path d="M110 104 Q119 112 128 104" {...line} />
          <path d="M94 138 Q100 143 106 138" {...line} strokeWidth={4} />
          <circle cx="56" cy="146" r="13" fill={fill('#F0508C')} {...body} />
          <circle cx="144" cy="146" r="13" fill={fill('#F0508C')} {...body} />
        </>
      )
      break
    case 'tedio':
      art = (
        <>
          <text x="140" y="60" fontSize="22" fontWeight="800" fill={outline ? INK : e.corForte} fontFamily="Nunito, sans-serif">z</text>
          <text x="154" y="42" fontSize="28" fontWeight="800" fill={outline ? INK : e.corForte} fontFamily="Nunito, sans-serif">Z</text>
          <path
            d="M38 150 C34 108 60 78 100 78 C140 78 166 108 162 150 C160 166 142 170 130 162 C120 174 108 174 100 164 C90 174 74 174 68 162 C56 170 40 166 38 150 Z"
            fill={fill(e.cor)}
            {...body}
          />
          <path d="M70 120 L94 120 M106 120 L130 120" {...line} />
          <path d="M74 120 A8 8 0 0 0 90 120 Z M110 120 A8 8 0 0 0 126 120 Z" fill={INK} />
          <path d="M88 146 L112 146" {...line} />
        </>
      )
      break
    case 'nostalgia':
      art = (
        <>
          <rect x="44" y="34" width="112" height="140" rx="22" fill={fill(e.cor)} {...body} />
          <rect x="56" y="46" width="88" height="84" rx="14" fill={fill('#F6E3C8')} {...body} />
          <circle cx="70" cy="104" r="7" fill={fill('#F2A68A')} opacity={outline ? 1 : 0.7} {...body} />
          <circle cx="130" cy="104" r="7" fill={fill('#F2A68A')} opacity={outline ? 1 : 0.7} {...body} />
          <path d="M72 86 Q80 94 88 86" {...line} />
          <path d="M112 86 Q120 94 128 86" {...line} />
          <path d="M88 108 Q100 118 112 108" {...line} />
          <path
            d="M100 152 m0 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0"
            stroke={outline ? INK : '#fff'}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )
      break
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={`${e.personagem}, personagem da ${e.nome}`}
      className={`${animated ? 'animate-float' : ''} ${className}`}
    >
      <ellipse cx="100" cy="190" rx="46" ry="6" fill={INK} opacity="0.12" />
      {art}
    </svg>
  )
}
