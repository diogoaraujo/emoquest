# Salas interativas — arquitetura, privacidade e LGPD

Para: quem desenvolve, mantém ou avalia a conformidade do EmoQuest.

## Visão geral

```
Navegador (GitHub Pages)                         API (Node + Fastify)                PostgreSQL
┌──────────────────────────┐   HTTPS + JSON   ┌──────────────────────────┐        ┌─────────────┐
│ Responsável  (Bearer)    │ ───────────────▶ │ /api/auth   /api/rooms   │ ─────▶ │ users       │
│ Jovem        (token sala)│ ───────────────▶ │ /api/public              │        │ rooms …     │
│ Visualizador (link)      │ ───────────────▶ │ /api/shared/:token       │        │ aggregates  │
└──────────────────────────┘                  └──────────────────────────┘        └─────────────┘
```

- **Sala** = grupo permanente. **Sessão** = uma aplicação de atividade (histórias ou check-in) numa data.
- A mesma sala é reutilizada durante o ano. Cada sessão tem resultados próprios, e os gráficos comparam sessões.
- Histórias e emoções são compartilhadas entre frontend e API (`src/data`). A API **revalida cada escolha** contra o caminho da história e **recalcula a pontuação**. O cliente só informa "qual escolha", nunca pontos.

## Modelo de dados

| Tabela | Conteúdo | Classe |
|---|---|---|
| `users` | nome, e-mail, hash da senha (scrypt) | identificável (responsável) |
| `auth_tokens` | hash SHA-256 do token de login, expiração | segredo |
| `rooms` | nome, dono, código de entrada, token do painel, k, retenção, aceite da base legal | configuração |
| `participants` | UUID, hash do token do aparelho, versão e data do consentimento, faixa etária opcional (nunca a idade exata) | **pseudonimizado** |
| `participant_identities` | nome/apelido informado (opcional) | **identificável — isolado** |
| `game_sessions` | título, atividade, histórias, status, datas | configuração |
| `responses` | cada escolha (história, momento, índice), efeitos calculados | pseudonimizado |
| `results` | pontuação final e emoção predominante por participante/sessão | pseudonimizado |
| `session_aggregates` | `n`, somas de proporções por emoção, contagem de predominantes | **estatístico, sem identificadores** |
| `audit_events` | quem acessou dados identificáveis, quando, em qual sala (sem conteúdo) | auditoria |

Todas as chaves estrangeiras usam `ON DELETE CASCADE`. Apagar conta, sala, sessão ou participante remove tudo o que depende dela. `session_aggregates` é recalculado a cada resultado novo ou excluído, então a exclusão a pedido do titular também sai dos gráficos.

## Quem acessa o quê

| Quem | Como se autentica | Pode ver |
|---|---|---|
| Responsável | e-mail + senha → token Bearer (7 dias) | suas salas, nomes, respostas e resultados individuais (cada acesso é auditado), dashboard com valores exatos |
| Jovem | token aleatório gerado ao entrar, guardado só no aparelho | o próprio resultado, a lista de sessões da sala e o agregado **anonimizado** da turma |
| Visualizador | link `#/compartilhado/<token>` (gerado, trocado ou desativado pelo responsável) | só agregados anonimizados |

Isolamento: toda rota `/api/rooms/:roomId/*` filtra por `owner_id = usuário`. Uma sala de outra conta responde **404**, sem revelar que existe. Rotas de participante filtram pela sala do token, então um participante não alcança sessões de outra sala.

## Anonimização (proteção contra reidentificação)

Aplicada na leitura para participantes e visualizadores (`server/src/lib/analytics.ts`):

1. **Só sessões encerradas.** Evita o *ataque de diferença*: comparar o agregado antes e depois de alguém terminar revelaria o resultado daquela pessoa.
2. **Limiar k.** Sessões com menos de `max(k da sala, 3)` participantes ficam ocultas. Não é possível configurar k abaixo de 3. Com 2 pessoas a sessão é uma **dupla** e com 1 é **individual**: todos participam normalmente; só o resultado de grupo não é exibido.
3. **Supressão de células pequenas.** Uma emoção predominante para menos de 3 pessoas aparece como "poucas", sem número.
4. **Generalização.**
   - Médias de emoção são arredondadas a 1%.
   - Percentuais de predominância usam passos de 5%.
   - O número de participantes é mostrado em faixas ("3 ou mais", "5 ou mais", "10 ou mais"), nunca exato.
5. **Sem identificadores nas respostas.** Os endpoints agregados leem só `session_aggregates`. Os testes verificam que nomes, `participantId` e e-mails nunca aparecem nessas respostas.

O responsável vê valores exatos, porque é o controlador dos dados do grupo. Mesmo assim, os gráficos dele também vêm só dos agregados. Nomes aparecem apenas nas telas "Pessoas" e "Resultados individuais", e ficam ocultos por padrão na tela da sessão.

## LGPD

- **Papéis.** O responsável pela sala (normalmente em nome da instituição) é o **controlador**. Quem mantém a instalação do EmoQuest é o **operador**.
- **Adolescentes (art. 14).**
  - O tratamento segue o melhor interesse do adolescente.
  - Ao criar a sala, o responsável declara ter autorização institucional e, quando necessário, dos responsáveis legais (`legal_basis_ack_at`).
  - O jovem vê, antes de entrar, o que é coletado, para quê, quem vê, por quanto tempo e como apagar, e manifesta concordância. A versão do texto fica registrada (`consent_version`).
- **Dados potencialmente sensíveis.** Resultados emocionais recebem o tratamento de dado sensível:
  - minimização (nome opcional, sem texto livre, sem contato ou localização);
  - finalidade restrita, a educativa;
  - nenhuma decisão automatizada sobre o jovem.
- **Retenção** (`server/src/lib/retention.ts`, na inicialização e a cada 24h):
  - Depois de `retention_days` (30–730, padrão 90), respostas e resultados individuais são apagados.
  - Fica só o agregado de sessões com pelo menos k pessoas.
  - Sessões menores são apagadas por inteiro.
  - Participantes inativos são apagados.
- **Direitos do titular (art. 18).** O jovem apaga a própria participação na página da sala. O responsável pode apagar participantes, sessões, a sala ou a conta, e tudo é removido em cascata.
- **Transparência.** Há uma política de privacidade em `#/privacidade`. Ela é um **modelo** e deve ser revisada pela instituição ou pelo(a) encarregado(a) antes do uso real.

## Segurança

- **Senhas e tokens:** senhas com scrypt e sal. Tokens de login e de participante são aleatórios (256 bits) e ficam no banco só como hash SHA-256.
- **Validação:** Zod em todas as entradas, corpo limitado a 32 KB e caracteres de controle removidos de nomes.
- **Limites de tentativas:** global de 300/min; login e cadastro, 10/min; entrada em sala, 20/min.
- **Login sem vazamento:** tempo de resposta constante no login, para não revelar quais e-mails existem.
- **Rede e cabeçalhos:** CORS restrito às origens configuradas, `helmet` e `Cache-Control: no-store`.
- **Logs:** cabeçalhos de autorização são removidos dos logs, e o corpo das requisições não é registrado.
- **Códigos e links:** o código de sala tem cerca de 49 bits e pode ser trocado se vazar. O link do painel pode ser regenerado ou desativado. Nenhum link contém dado pessoal.
- **Terceiros:** o QR Code é gerado no próprio navegador; o link não passa por serviços de terceiros.

## Próximos passos sugeridos

- Co-responsáveis por sala (tabela `room_members` com papéis) e convites por e-mail.
- Atualização ao vivo via SSE no lugar de polling.
- Exportação de relatório anonimizado (PDF/CSV) e exportação dos dados do titular (portabilidade).
- Recuperação de senha por e-mail e 2FA para responsáveis.
- Rate limit distribuído (Redis) com várias instâncias da API.
