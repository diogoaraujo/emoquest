import { useEffect, useState } from 'react'

/** QR Code gerado no próprio navegador (o link nunca é enviado a serviços de terceiros). */
export function QrCode({ value, size = 220, className = '' }: { value: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    import('qrcode').then((QR) =>
      QR.toDataURL(value, { margin: 1, width: size * 2, errorCorrectionLevel: 'M', color: { dark: '#2a2346', light: '#ffffff' } }).then((url) => {
        if (alive) setSrc(url)
      }),
    )
    return () => {
      alive = false
    }
  }, [value, size])

  return src ? (
    <img src={src} width={size} height={size} alt="QR Code para entrar na sala" className={`rounded-2xl bg-white ${className}`} />
  ) : (
    <div style={{ width: size, height: size }} className={`animate-pulse rounded-2xl bg-ink/10 ${className}`} aria-hidden />
  )
}
