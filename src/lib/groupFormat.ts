/** Formato de uma sessão pelo número de participantes. Nunca impede ninguém de participar. */
export type GroupFormat = 'individual' | 'dupla' | 'grupo'

export const groupFormat = (n: number): GroupFormat | null => (n <= 0 ? null : n === 1 ? 'individual' : n === 2 ? 'dupla' : 'grupo')

export const GROUP_FORMAT_LABEL: Record<GroupFormat, string> = { individual: 'Individual', dupla: 'Dupla', grupo: 'Grupo' }
