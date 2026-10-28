import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize('NFKC'), salt, 64)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, keyB64] = stored.split('$')
  if (algo !== 'scrypt' || !saltB64 || !keyB64) return false
  const expected = Buffer.from(keyB64, 'base64')
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length)
  return timingSafeEqual(key, expected)
}

/** Token aleatório opaco (enviado ao cliente). No banco guardamos só o hash. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url')

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

// Sem caracteres ambíguos (0/O, 1/I/L) para facilitar digitar o código lido em voz alta.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Código de sala com ~49 bits de entropia: curto o bastante para digitar, difícil de adivinhar. */
export function joinCode(length = 10): string {
  const bytes = randomBytes(length)
  let out = ''
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length]
  return out
}
