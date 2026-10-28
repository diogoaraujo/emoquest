/**
 * Modelo de dados do EmoQuest.
 *
 * Separação de dados (LGPD):
 *  - Identificáveis: `users` (responsáveis) e `participant_identities` (nome informado pelo jovem).
 *    Só são lidos por rotas do responsável pela sala.
 *  - Pseudonimizados: `participants`, `responses`, `results` — ligados por UUID, sem nome.
 *  - Estatísticos: `session_aggregates` — somas e contagens por sessão, sem nenhum identificador
 *    de participante. É a ÚNICA fonte dos gráficos e dashboards.
 */
import { sql } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
})

export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('auth_tokens_user_idx').on(t.userId)],
)

/** Sala = grupo permanente (ex.: uma turma durante o ano letivo). */
export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    /** Código do link/QR de entrada. Pode ser trocado pelo responsável a qualquer momento. */
    joinCode: text('join_code').notNull().unique(),
    /** Token do painel compartilhado (somente dados agregados). Nulo = compartilhamento desligado. */
    shareToken: text('share_token').unique(),
    /** k mínimo para exibir qualquer resultado agregado a quem não é responsável. */
    minGroupSize: integer('min_group_size').notNull().default(5),
    retentionDays: integer('retention_days').notNull().default(365),
    /** Responsável declarou base legal / autorização institucional ao criar a sala. */
    legalBasisAckAt: timestamp('legal_basis_ack_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('rooms_owner_idx').on(t.ownerId)],
)

/** Participante pseudonimizado: só um UUID e o hash do token guardado no celular do jovem. */
export const participants = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    consentVersion: text('consent_version').notNull(),
    consentedAt: timestamp('consented_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index('participants_room_idx').on(t.roomId)],
)

/** Dado identificável, isolado em tabela própria. */
export const participantIdentities = pgTable('participant_identities', {
  participantId: uuid('participant_id')
    .primaryKey()
    .references(() => participants.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
})

/** Sessão = uma aplicação de atividade na sala (uma data, um jogo). */
export const gameSessions = pgTable(
  'game_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    /** 'historias' (uma ou mais histórias) | 'checkin' (como você está hoje?) */
    activity: text('activity').notNull(),
    storyIds: jsonb('story_ids').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** 'aberta' | 'encerrada' */
    status: text('status').notNull().default('aberta'),
    createdAt: createdAt(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
  },
  (t) => [index('sessions_room_idx').on(t.roomId)],
)

/** Cada escolha feita numa história. Efeitos calculados no servidor, nunca enviados pelo cliente. */
export const responses = pgTable(
  'responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    storyId: text('story_id').notNull(),
    nodeId: text('node_id').notNull(),
    choiceIndex: integer('choice_index').notNull(),
    effects: jsonb('effects').$type<Record<string, number>>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('responses_session_participant_idx').on(t.sessionId, t.participantId),
    unique('responses_one_per_node').on(t.sessionId, t.participantId, t.storyId, t.nodeId),
  ],
)

/** Resultado emocional final de um participante numa sessão. */
export const results = pgTable(
  'results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    scores: jsonb('scores').$type<Record<string, number>>().notNull(),
    dominant: text('dominant').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('results_one_per_session').on(t.sessionId, t.participantId)],
)

/**
 * Estatísticas por sessão, sem qualquer identificador de participante.
 * Recalculadas sempre que um resultado entra ou sai (inclusive em exclusões a pedido do titular).
 */
export const sessionAggregates = pgTable('session_aggregates', {
  sessionId: uuid('session_id')
    .primaryKey()
    .references(() => gameSessions.id, { onDelete: 'cascade' }),
  n: integer('n').notNull(),
  /** Soma, entre participantes, da fração (0..1) de cada emoção no resultado individual. */
  shareSums: jsonb('share_sums').$type<Record<string, number>>().notNull(),
  /** Quantas pessoas tiveram cada emoção como predominante. */
  dominantCounts: jsonb('dominant_counts').$type<Record<string, number>>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** Registro de acessos a dados identificáveis (sem conteúdo pessoal). */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    roomId: uuid('room_id'),
    action: text('action').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('audit_room_idx').on(t.roomId)],
)

