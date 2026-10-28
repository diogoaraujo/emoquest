import type { Emotion, EmotionId } from '../types'

export const EMOTIONS: Emotion[] = [
  {
    id: 'alegria',
    nome: 'Alegria',
    personagem: 'Lumi',
    cor: '#FFC93C',
    corSuave: '#FFF4D1',
    corForte: '#8A5A00',
    frase: 'Bora ver o lado brilhante?',
    descricao:
      'Lumi aparece quando algo faz sentido, quando você se sente em conexão com alguém, quando conquista algo ou simplesmente curte o momento.',
    funcao:
      'A alegria nos aproxima das pessoas e do que nos faz bem. Ela dá energia, ajuda a criar memórias e faz a gente querer repetir experiências que nos fazem crescer.',
    sinais: ['Vontade de sorrir e de estar com gente', 'Energia extra no corpo', 'Pensamentos mais leves e criativos'],
    intensa:
      'Quando tentamos ficar alegres o tempo todo, podemos acabar escondendo outras emoções que também precisam ser ouvidas.',
    acolher: [
      'Perceba o que te trouxe alegria e guarde essa pista',
      'Compartilhe os momentos bons com quem você gosta',
      'Você não precisa fingir alegria para agradar ninguém',
    ],
    falas: ['Isso aí! Pequenas coisas também contam.', 'Que tal aproveitar esse momento?', 'Conexão é tudo, né?'],
    reflexao: 'O que, nos últimos dias, te deu energia de verdade?',
  },
  {
    id: 'tristeza',
    nome: 'Tristeza',
    personagem: 'Gota',
    cor: '#5B8DEF',
    corSuave: '#E3ECFF',
    corForte: '#1E3F8A',
    frase: 'Tudo bem ficar um pouquinho pra baixo.',
    descricao:
      'Gota aparece quando perdemos algo ou alguém importante, quando algo não sai como esperávamos ou quando sentimos falta.',
    funcao:
      'A tristeza nos faz desacelerar para entender o que importa. Ela também mostra a quem está por perto que precisamos de apoio — e isso aproxima.',
    sinais: ['Vontade de silêncio e de ficar no seu canto', 'Choro ou nó na garganta', 'Menos energia para fazer as coisas'],
    intensa:
      'Se a tristeza dura muitas semanas, tira a vontade de fazer tudo ou vem com pensamentos de se machucar, é hora de conversar com um adulto de confiança ou com um profissional.',
    acolher: [
      'Permita-se sentir, sem pressa',
      'Converse com alguém em quem você confia',
      'Faça algo gentil por você: música, banho, descanso',
    ],
    falas: [
      'Sentir isso mostra que algo importava pra você.',
      'Posso ficar aqui com você um pouquinho?',
      'Chorar também é um jeito de se cuidar.',
    ],
    reflexao: 'Quando você fica triste, quem ou o que te acolhe?',
  },
  {
    id: 'raiva',
    nome: 'Raiva',
    personagem: 'Brasa',
    cor: '#F25C3B',
    corSuave: '#FFE4DC',
    corForte: '#8C2410',
    frase: 'Ei! Isso não é justo!',
    descricao:
      'Brasa aparece quando sentimos injustiça, quando nossos limites são desrespeitados ou quando algo nos impede de alcançar o que queremos.',
    funcao:
      'A raiva é protetora: ela dá energia para defender nossos limites, nossos valores e as pessoas que amamos.',
    sinais: ['Calor no rosto e no peito', 'Mandíbula ou punhos apertados', 'Vontade de falar alto ou agir rápido'],
    intensa:
      'Quando a raiva vira agressão — contra os outros ou contra si — ela machuca. A ideia não é engolir a raiva, e sim expressá-la sem ferir ninguém.',
    acolher: [
      'Dê um tempo antes de responder: respire e conte até 10',
      'Gaste a energia: caminhe, dance, corra',
      'Fale do que sentiu começando com "eu me senti..."',
    ],
    falas: ['Seus limites importam!', 'Bora transformar essa energia em atitude?', 'Calma, mas sem engolir o que você sente.'],
    reflexao: 'Que limite seu a raiva está tentando proteger ultimamente?',
  },
  {
    id: 'medo',
    nome: 'Medo',
    personagem: 'Pipo',
    cor: '#9B7BEA',
    corSuave: '#EEE7FF',
    corForte: '#4A2C9B',
    frase: 'E se... for perigoso?',
    descricao:
      'Pipo aparece diante do desconhecido, de riscos e de situações em que podemos nos machucar — no corpo ou nos sentimentos.',
    funcao:
      'O medo é um alarme interno: ele nos deixa atentos e cuidadosos, ajudando a avaliar riscos antes de agir.',
    sinais: ['Coração acelerado', 'Frio na barriga', 'Vontade de fugir ou de travar'],
    intensa:
      'Quando o medo impede você de viver coisas importantes, vale a pena enfrentá-lo aos poucos, com apoio.',
    acolher: [
      'Pergunte-se: o perigo é real ou imaginado?',
      'Dê passos pequenos em direção ao que assusta',
      'Peça companhia para encarar desafios',
    ],
    falas: ['Cuidado é bom... mas coragem também!', 'Tudo bem ir devagar.', 'Medo e coragem podem andar juntos.'],
    reflexao: 'O que você faria se o medo estivesse um pouco mais baixinho?',
  },
  {
    id: 'nojinho',
    nome: 'Nojinho',
    personagem: 'Azedinha',
    cor: '#7BC950',
    corSuave: '#E6F7DA',
    corForte: '#2F6B12',
    frase: 'Eca! Isso não combina comigo.',
    descricao:
      'Azedinha aparece quando algo parece estragado, nojento ou contra aquilo em que acreditamos — seja uma comida, um lugar ou uma atitude.',
    funcao:
      'O nojo nos protege do que pode nos fazer mal, no corpo ou nas relações. Ele ajuda a definir nossos gostos, limites e valores.',
    sinais: ['Careta e nariz franzido', 'Vontade de se afastar', 'Sensação de enjoo'],
    intensa:
      'Quando o nojo vira desprezo por pessoas ou grupos, ele exclui e machuca. Ter gosto pessoal é diferente de julgar quem é diferente.',
    acolher: [
      'Pergunte-se: isso me faz mal ou só é diferente de mim?',
      'Respeite seus gostos sem humilhar os dos outros',
      'Use o nojinho como pista dos seus valores',
    ],
    falas: ['Ter gostos próprios é ótimo!', 'Hmm... isso combina com você?', 'Diferente não é sinônimo de ruim, viu?'],
    reflexao: 'Quais valores seus ficam claros quando algo te dá nojinho?',
  },
  {
    id: 'ansiedade',
    nome: 'Ansiedade',
    personagem: 'Turbo',
    cor: '#FF8A3D',
    corSuave: '#FFE9D9',
    corForte: '#8F3D00',
    frase: 'Já pensou em TODOS os cenários possíveis?',
    descricao:
      'Turbo aparece quando pensamos no futuro: provas, apresentações, escolhas e tudo aquilo que ainda não aconteceu.',
    funcao:
      'A ansiedade tenta nos preparar para o que vem pela frente. Na medida certa, ela ajuda a planejar, estudar e se organizar.',
    sinais: ['Pensamentos acelerados e muitos "e se...?"', 'Dificuldade para dormir', 'Inquietação, roer unha, perna balançando'],
    intensa:
      'Quando a ansiedade é constante, provoca crises ou atrapalha a rotina, conversar com um profissional de saúde mental ajuda muito.',
    acolher: [
      'Respire devagar: inspire em 4, segure 4, solte em 4',
      'Volte para o agora: o que você vê, ouve e sente?',
      'Divida tarefas grandes em passos pequenos',
    ],
    falas: ['Um passo de cada vez, tá?', 'Planejar ajuda... mas não precisa prever tudo!', 'Respira comigo: 4, 4, 4.'],
    reflexao: 'Quando a ansiedade aparece, que pequeno passo te ajuda a voltar para o presente?',
  },
  {
    id: 'inveja',
    nome: 'Inveja',
    personagem: 'Mirra',
    cor: '#2EC4B6',
    corSuave: '#D9F6F3',
    corForte: '#0E625B',
    frase: 'Por que essa pessoa tem e eu não?',
    descricao:
      'Mirra aparece quando nos comparamos com outras pessoas e percebemos que elas têm algo que desejamos.',
    funcao:
      'A inveja revela desejos. Ela mostra o que é importante para você e pode virar motivação para correr atrás dos seus próprios objetivos.',
    sinais: ['Comparação constante, principalmente nas redes', 'Incômodo com a conquista do outro', 'Sensação de ser "menos"'],
    intensa:
      'Quando a comparação toma conta, a gente esquece da própria história. Lembre-se: redes sociais mostram recortes, não a vida inteira.',
    acolher: [
      'Pergunte-se: o que exatamente eu desejo aqui?',
      'Transforme comparação em inspiração',
      'Dê um tempo das redes quando elas pesarem',
    ],
    falas: ['O que esse desejo diz sobre você?', 'Cada pessoa tem seu próprio tempo.', 'Stories são recortes, lembra?'],
    reflexao: 'O que a inveja já te mostrou sobre aquilo que você deseja de verdade?',
  },
  {
    id: 'vergonha',
    nome: 'Vergonha',
    personagem: 'Rubi',
    cor: '#FF6FA5',
    corSuave: '#FFE3EE',
    corForte: '#93184B',
    frase: 'Ai... será que todo mundo viu?',
    descricao:
      'Rubi aparece quando sentimos que estamos sendo observados ou julgados, ou que fizemos algo "errado" na frente dos outros.',
    funcao:
      'A vergonha nos ajuda a perceber as regras sociais e a cuidar das relações. Ela mostra que nos importamos com o que os outros sentem.',
    sinais: ['Rosto quente e vermelho', 'Vontade de sumir ou se esconder', 'Olhar para baixo'],
    intensa:
      'Quando a vergonha vira a ideia de que "há algo de errado comigo", ela pesa demais. Errar é humano — e todo mundo já pagou mico.',
    acolher: [
      'Lembre-se: as pessoas prestam menos atenção em nós do que imaginamos',
      'Trate-se com a mesma gentileza que você teria com uma amizade',
      'Converse sobre o que te envergonha com alguém de confiança',
    ],
    falas: ['Todo mundo já pagou mico, juro!', 'Errar faz parte de aprender.', 'Ninguém te julga tanto quanto você.'],
    reflexao: 'Como você trataria uma amizade que passasse pela mesma situação que te envergonhou?',
  },
  {
    id: 'tedio',
    nome: 'Tédio',
    personagem: 'Morno',
    cor: '#6C6FD1',
    corSuave: '#E5E6FA',
    corForte: '#2E3088',
    frase: 'Aff... tanto faz.',
    descricao:
      'Morno aparece quando nada parece interessante, quando a rotina fica repetitiva ou quando nos desconectamos do que gostamos.',
    funcao:
      'O tédio é um sinal de que precisamos de algo novo. Ele abre espaço para a imaginação, a criatividade e a descoberta de novos interesses.',
    sinais: ['Sensação de que o tempo não passa', 'Falta de vontade de começar algo', 'Rolar o feed sem prestar atenção'],
    intensa:
      'Se o "tanto faz" aparece para tudo, por muito tempo, pode ser sinal de um desânimo mais profundo — vale conversar sobre isso.',
    acolher: [
      'Experimente algo novo, mesmo que pequeno',
      'Deixe a mente vagar sem telas por alguns minutos',
      'Pergunte-se: do que eu estou sentindo falta?',
    ],
    falas: ['Hmm... e se você tentasse algo diferente?', 'Às vezes não fazer nada dá ideias.', 'Tédio é a criatividade bocejando.'],
    reflexao: 'O que você poderia experimentar de novo nesta semana?',
  },
  {
    id: 'nostalgia',
    nome: 'Nostalgia',
    personagem: 'Sépia',
    cor: '#C99A6B',
    corSuave: '#F6EADB',
    corForte: '#6B4320',
    frase: 'Lembra daquela vez...?',
    descricao:
      'Sépia aparece quando lembramos de momentos, lugares e pessoas do passado — às vezes com um sorriso, às vezes com um apertinho no peito.',
    funcao:
      'A nostalgia conecta quem fomos com quem somos. Ela fortalece nossa identidade e nossos laços, e nos lembra do que é importante.',
    sinais: ['Mistura de alegria e saudade', 'Vontade de rever fotos, músicas e lugares', 'Sorriso com o coração apertado'],
    intensa: 'Quando ficamos presos só ao passado, podemos esquecer de criar novas memórias no presente.',
    acolher: [
      'Compartilhe lembranças com quem viveu aquilo com você',
      'Agradeça pelo que foi bom',
      'Use o passado como inspiração para o agora',
    ],
    falas: ['Que lembrança bonita, né?', 'O passado também ajuda a construir quem você é.', 'Que tal criar novas memórias hoje?'],
    reflexao: 'Qual lembrança te dá força quando as coisas ficam difíceis?',
  },
]

const BY_ID = Object.fromEntries(EMOTIONS.map((e) => [e.id, e])) as Record<EmotionId, Emotion>

export const getEmotion = (id: EmotionId): Emotion => BY_ID[id]
