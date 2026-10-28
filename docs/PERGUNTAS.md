# Banco de perguntas

Perguntas avulsas usadas na **partida rápida** (`#/jogar/perguntas/:tema`): o jogo sorteia 10 perguntas do tema e da faixa etária do jogador.

- Arquivos: `src/data/perguntas/<tema>/<faixa>/<NNN>.json`, com até 250 perguntas cada. Uma partida baixa só um arquivo sorteado (ou um de cada, para 5 temas, em "todos os temas").
- Temas: `escola`, `amizades`, `familia`, `amor`, `quem-sou`, `futuro`, `respeito`, `momentos-dificeis`, `conquistas`, `tempo-livre`.
- Faixas: `13-16` e `17-23`. Quem tem menos de 13 joga com `13-16` sem os temas sensíveis (`amor`, `momentos-dificeis`); quem tem mais de 23 joga com `17-23`.
- Meta: 1.000 perguntas por tema (334 em `13-16` + 666 em `17-23`), 10.000 no total.
- Validação: `npm run perguntas:check`.

## Formato

```json
{
  "id": "familia-13-16-00001",
  "text": "Seu pai esqueceu de ir à sua apresentação na escola. À noite, ele pergunta como foi.",
  "choices": [
    { "text": "Responder \"foi normal\" e ir para o quarto", "effects": { "vergonha": 2, "tristeza": 1 } },
    { "text": "Contar que a ausência dele te deixou triste", "effects": { "tristeza": 2, "alegria": 1 } },
    { "text": "Dizer que ele nunca aparece quando importa", "effects": { "raiva": 3 } }
  ]
}
```

- `text`: a situação, em 2ª pessoa ("você"), 40 a 260 caracteres. Termina descrevendo o momento da decisão.
- `choices`: exatamente 3 opções, de 3 a 110 caracteres cada, descrevendo o que a pessoa **faz, diz ou pensa** ("Responder...", "Mandar mensagem...", "Fingir que..."). As opções **nunca nomeiam a emoção** — é proibido começar com "Sentir" e deve-se evitar citar alegria, raiva, medo etc.; a emoção fica só nos `effects`.
- `effects`: 1 ou 2 emoções por opção, valores inteiros de 1 a 3, soma de no máximo 4. Varie: nem sempre uma emoção só com valor 3.
- Emoções: `alegria`, `tristeza`, `raiva`, `medo`, `nojinho`, `ansiedade`, `inveja`, `vergonha`, `tedio`, `nostalgia`.
- A emoção mais forte deve ser **diferente** em cada uma das 3 opções (em caso de empate, vale a que vem primeiro na lista acima, como no jogo).

## Regras de conteúdo

- Português do Brasil, linguagem do dia a dia da faixa etária, sem gírias datadas e sem palavrões.
- **Não existe resposta certa.** Todas as opções são reações humanas plausíveis; nenhuma é ridícula ou "a errada óbvia".
- **Gênero neutro para o jogador**: evite adjetivos que marquem gênero de quem joga ("ficar chateado" → "ficar com raiva"; "sentir-se sozinho" → "sentir solidão"). Outros personagens podem ter nome e gênero.
- Nomes de personagens variados e brasileiros; diversidade de origem, classe, corpo, família e cidade, sem estereótipos.
- Situações concretas e específicas (lugar, pessoa, o que aconteceu), não genéricas.
- Nada de marcas, celebridades ou pessoas reais.
- Nunca escreva xingamentos ou ofensas literalmente (racistas, LGBTfóbicos, gordofóbicos, capacitistas, sexuais): descreva-os ("um apelido racista", "um xingamento homofóbico").

### Por faixa

- **13–16:** escola, família, primeiras amizades e paixões, redes sociais, mesada. Romance só como sentimentos, conversa, mãos dadas, beijo citado de leve. **Nenhuma** referência a sexo, álcool ou drogas usados pelo jogador.
- **17–23:** fim do ensino médio, Enem/vestibular, faculdade ou curso técnico, primeiro emprego e carreira, autonomia, morar só, contas, namoro e relacionamentos adultos, festas. Sexo e álcool só podem ser citados de forma não explícita e com foco em consentimento, pressão do grupo e escolhas.

### Temas sensíveis

- **amor** (paixão, orientação sexual, identidade de gênero, respeito): acolhedor e sem julgamento; preconceito aparece como algo que acontece *com* ou *perto* do jogador, nunca como opção divertida.
- **momentos-dificeis** (luto, ansiedade, tristeza profunda, doença na família): nunca descrever automutilação ou suicídio em detalhe, nem métodos. Pelo menos uma opção de cada pergunta envolve buscar alguém (amizade, família, adulto de confiança, profissional).
- **respeito** (bullying, racismo, capacitismo, gordofobia, LGBTfobia, classe): a vítima nunca é ridicularizada no texto; o jogador pode ser alvo, testemunha ou (às vezes) quem errou e percebe.
