# EmoQuest

Jogo web interativo e educativo sobre emoções para adolescentes de 14 a 18 anos. Quem joga vive situações do cotidiano (escola nova, grupo do WhatsApp, véspera de prova, festa, domingo sem nada), faz escolhas que mudam o rumo da história e, no final, descobre qual emoção predominou — sempre com a mensagem de que **nenhuma emoção é boa ou ruim**.

## Funcionalidades

- **5 histórias com ramificações**: cada escolha leva a um caminho diferente e soma pontos às emoções.
- **Jornada completa**: as 5 histórias em sequência, com um resultado acumulado.
- **10 personagens originais** desenhados em SVG: Lumi (Alegria), Gota (Tristeza), Brasa (Raiva), Pipo (Medo), Azedinha (Nojinho), Turbo (Ansiedade), Mirra (Inveja), Rubi (Vergonha), Morno (Tédio) e Sépia (Nostalgia).
- **Feedback a cada escolha**: o personagem da emoção que mais pesou aparece e comenta.
- **Painel das emoções** em tempo real durante o jogo.
- **Resultado final**: emoção predominante, trio de apoio, mix completo em %, conteúdo educativo, pergunta para reflexão e a lista das escolhas feitas.
- **Galeria de personagens**: impressão de todos os cards ou de um só, em versão colorida ou **para colorir**.
- **Guia "Sobre as emoções"**: para que serve cada emoção, como ela aparece, quando fica intensa e como acolher, além de indicação de apoio (CVV 188).
- **Salas interativas** para professores, psicólogos e profissionais que conduzem grupos (detalhes abaixo).

## Salas interativas

Cada **sala** é um grupo permanente (ex.: uma turma durante o ano letivo). Cada atividade aplicada é uma **sessão** independente, para comparar datas diferentes sem misturar interações.

- **Responsáveis** criam conta, criam salas e se tornam responsáveis por elas.
- **Jovens entram pelo link ou QR Code**, sem cadastro. O nome ou apelido é opcional, e a entrada passa por uma tela de transparência e consentimento.
- **Atividades:** histórias interativas (uma ou várias) ou check-in emocional ("como você está hoje?").
- **Histórico:** data, hora, sala, sessão, cada escolha e o resultado emocional. A pontuação é **recalculada no servidor**, nunca enviada pelo cliente.
- **Dashboard interativo:** distribuição das emoções, emoção predominante, evolução no tempo, comparação entre sessões, KPIs, filtro por sessão e visão em tabela.
- **Privacidade:**
  - Nomes ficam visíveis só para o responsável.
  - Participantes e visualizadores do painel compartilhado veem apenas agregados anonimizados: k ≥ 5, só sessões encerradas, células pequenas ocultas e números arredondados.
  - Os jovens podem apagar a própria participação.
  - Há retenção automática.

Arquitetura, modelo de dados, regras de anonimização e LGPD: **[docs/SALAS.md](docs/SALAS.md)**.

## Mobile first

O EmoQuest foi pensado para o celular (telas de 320px a 430px) e se adapta a tablets e desktops:

- **Barra de abas inferior** no celular, ao alcance do polegar. Durante o jogo entra em **modo imersivo**, sem barras.
- **Botões de ação fixos no rodapé** ("Continuar", "Próxima história"), com respeito às *safe areas* (notch e barra de gestos).
- Alvos de toque de no mínimo 48px, escolhas grandes com letras (A/B/C), feedback visual ao tocar e vibração leve (quando o aparelho suporta).
- Transições entre cenas, reações e resultado, com uma "revelação" animada do resultado. Tudo é desativado automaticamente com `prefers-reduced-motion`.
- Painel das emoções recolhível no celular e lateral no desktop. Fichas dos personagens abrem em *bottom sheet* que fecha arrastando para baixo.
- Texto base de 16px ou mais, contraste reforçado, foco gerenciado a cada cena (bom para leitores de tela) e link "pular para o conteúdo".
- Desempenho: telas carregadas sob demanda (*code splitting*), personagens em SVG inline (nenhuma imagem para baixar), fontes com `display=swap`.
- Compartilhamento nativo do resultado (Web Share API), ligação direta para o CVV (`tel:188`) e manifesto web para "adicionar à tela inicial" — sem precisar instalar app.
- Sem rolagem horizontal: verificado automaticamente em 320, 375 e 430px.

## Tecnologias

- **Frontend:** React 19 · TypeScript · Tailwind CSS v4 · Vite
- **API** (`server/`): Node.js · Fastify 5 · Drizzle ORM · PostgreSQL · Zod
- **Testes:** Vitest + PGlite (Postgres embutido)

## Como rodar

O jogo funciona sozinho. As salas precisam da API.

```bash
# 1) API — usa PGlite (Postgres embutido) em server/.data se DATABASE_URL estiver vazio
cd server
npm install
npm run dev          # http://localhost:3333
npm test             # testes de segurança, privacidade e regras do jogo

# 2) Frontend (em outro terminal, na raiz)
npm install
npm run dev          # http://localhost:5173 — /api é redirecionado para a API local
```

## Estrutura

```
src/
├── components/     # EmotionAvatar (personagens SVG), Navbar, Footer, ScoreBars, EmotionDetail
├── data/
│   ├── emotions.ts # personagens e conteúdo educativo das 10 emoções
│   └── stories.ts  # histórias (nós, escolhas, efeitos e finais)
├── hooks/          # useHashRoute (roteamento por hash)
├── lib/            # pontuação e armazenamento local
├── pages/          # Home, StorySelect, Play, Result, Characters, Learn
├── api/            # cliente HTTP, autenticação, hook de carregamento
├── pages/rooms/    # Auth, RoomsList, RoomDetail, SessionDetail, JoinRoom, SharedDashboard
├── types.ts
└── App.tsx
server/
├── src/db/         # schema.ts (Drizzle) e conexão (Postgres ou PGlite)
├── src/lib/        # analytics (agregação/anonimização), game (validação), retenção, cripto
├── src/routes/     # auth, rooms (responsável), participant (jovens), shared (painel público)
├── drizzle/        # migrações SQL
└── test/           # testes de integração
```

### Como adicionar uma história

Inclua um objeto em `src/data/stories.ts`. Cada nó tem um texto e escolhas; cada escolha define `effects` (pontos por emoção) e `next` (id do próximo nó). Nós com `ending: true` encerram a história.

```ts
{
  text: 'Situação...',
  choices: [
    { text: 'O que a pessoa faz', effects: { medo: 2, alegria: 1 }, next: 'proximo_no' },
  ],
}
```

## Publicação no GitHub Pages

O projeto já inclui `.github/workflows/deploy.yml`. Depois de criar o repositório `emoquest` no GitHub:

```bash
git add .
git commit -m "EmoQuest: MVP inicial"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/emoquest.git
git push -u origin main
```

No GitHub, vá em **Settings → Pages → Source** e escolha **GitHub Actions**. O site será publicado em `https://<seu-usuario>.github.io/emoquest/`. O roteamento usa hash (`#/jogar`), então funciona sem nenhuma configuração extra de servidor.

O workflow roda os testes da API e o build do frontend em todo push e pull request. Só publica a partir da `main`.

### Publicando a API

1. Crie um banco PostgreSQL (Neon, Supabase, RDS…) e um serviço Node (Render, Railway, Fly.io…). A imagem é gerada com `docker build -f server/Dockerfile .`, a partir da raiz.
2. Configure as variáveis do servidor (veja `server/.env.example`):
   - `DATABASE_URL`
   - `CORS_ORIGINS=https://<seu-usuario>.github.io`
   - `PUBLIC_APP_URL=https://<seu-usuario>.github.io/emoquest`
3. As migrações rodam sozinhas na inicialização. A retenção roda na inicialização e a cada 24h.
4. No GitHub, em **Settings → Secrets and variables → Actions → Variables**, crie:
   - `VITE_API_URL` com a URL pública da API
   - opcionalmente, `VITE_PRIVACY_CONTACT` com o contato do(a) encarregado(a) de dados

Use sempre HTTPS em produção.

## Aviso

O EmoQuest é uma ferramenta educativa para estimular o autoconhecimento e a inteligência emocional. Ele não é um teste psicológico e não substitui acompanhamento profissional.
