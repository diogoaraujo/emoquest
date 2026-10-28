import type { Story } from '../types'

export const STORIES: Story[] = [
  {
    id: 'escola-nova',
    title: 'Primeiro dia na escola nova',
    tagline: 'Sala nova, gente nova e aquele frio na barriga.',
    icon: '🏫',
    cover: 'medo',
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'É seu primeiro dia numa escola nova. Você entra na sala e todo mundo parece já ter seu grupinho. Sobrou um lugar vazio no fundo e outro ao lado de uma pessoa que está desenhando no caderno.',
        choices: [
          { text: 'Sentar ao lado de quem está desenhando e puxar papo sobre o desenho', effects: { alegria: 2, medo: 1 }, next: 'conversa' },
          { text: 'Ir para o fundo e ficar no celular até a aula começar', effects: { medo: 2, vergonha: 1 }, next: 'fundo' },
          { text: 'Pensar na escola antiga e nos amigos de lá', effects: { nostalgia: 3, tristeza: 1 }, next: 'lembranca' },
        ],
      },
      conversa: {
        text: 'A pessoa se chama Iara. Ela sorri e mostra o caderno cheio de personagens. No intervalo, ela te chama para sentar com a turma dela — só que você não conhece ninguém lá.',
        choices: [
          { text: 'Aceitar, mesmo com frio na barriga', effects: { alegria: 2, ansiedade: 1 }, next: 'intervalo' },
          { text: 'Agradecer e dizer que vai dar uma volta pela escola', effects: { medo: 1, tedio: 1 }, next: 'sozinho' },
        ],
      },
      fundo: {
        text: 'Lá do fundo, você ouve duas pessoas cochichando e rindo. Você não sabe se é sobre você.',
        choices: [
          { text: 'Imaginar que estão rindo de você e sentir o rosto esquentar', effects: { vergonha: 2, ansiedade: 2 }, next: 'professora' },
          { text: 'Pensar "pode ser sobre qualquer coisa" e respirar fundo', effects: { medo: 1, alegria: 1 }, next: 'professora' },
          { text: 'Achar tudo um saco e torcer para a aula acabar logo', effects: { tedio: 2, raiva: 1 }, next: 'professora' },
        ],
      },
      lembranca: {
        text: 'Você abre o grupo da escola antiga. Seus amigos postaram uma foto juntos, sem você.',
        choices: [
          { text: 'Comentar "que saudade de vocês!"', effects: { nostalgia: 2, alegria: 1 }, next: 'professora' },
          { text: 'Sentir um aperto e guardar o celular', effects: { tristeza: 2 }, next: 'professora' },
          { text: 'Pensar que já te esqueceram — que injusto!', effects: { inveja: 2, raiva: 1 }, next: 'professora' },
        ],
      },
      professora: {
        text: 'A professora pede um trabalho em dupla e diz que cada um pode escolher com quem fazer. A Iara, que estava desenhando, ficou sem dupla.',
        choices: [
          { text: 'Chamar a Iara para fazer com você', effects: { alegria: 2, medo: 1 }, next: 'intervalo' },
          { text: 'Esperar alguém te escolher', effects: { medo: 2, vergonha: 1 }, next: 'sozinho' },
        ],
      },
      intervalo: {
        text: 'No intervalo, a turma conversa sobre uma série que você nunca viu. Todo mundo ri de uma piada interna.',
        choices: [
          { text: 'Perguntar sobre a série e pedir indicação', effects: { alegria: 2, medo: 1 }, next: 'fim_comeco' },
          { text: 'Ficar em silêncio e sentir que não pertence', effects: { vergonha: 2, tristeza: 1 }, next: 'fim_processo' },
          { text: 'Fazer careta: você acha essa série horrível', effects: { nojinho: 2, raiva: 1 }, next: 'fim_processo' },
        ],
      },
      sozinho: {
        text: 'Você passa o intervalo andando pelos corredores. Descobre uma biblioteca silenciosa e um mural cheio de clubes: música, xadrez, teatro.',
        choices: [
          { text: 'Anotar o horário do clube de música', effects: { alegria: 1, ansiedade: 1 }, next: 'fim_comeco' },
          { text: 'Sentar na biblioteca e respirar um pouco', effects: { tristeza: 1, tedio: 1 }, next: 'fim_processo' },
        ],
      },
      fim_comeco: {
        ending: true,
        text: 'O dia termina e você percebe: ainda é cedo, mas já existe um começo. Amizades levam tempo — e tudo bem sentir frio na barriga no caminho.',
      },
      fim_processo: {
        ending: true,
        text: 'O primeiro dia foi estranho, e tá tudo bem. Adaptar-se é um processo: as emoções que você sentiu hoje estão te ajudando a entender esse lugar novo.',
      },
    },
  },
  {
    id: 'grupo-do-zap',
    title: 'O grupo novo',
    tagline: 'Todo mundo combinou um rolê... num grupo em que você não está.',
    icon: '📱',
    cover: 'inveja',
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Sexta à noite. Pelos stories, você descobre que a galera está combinando um rolê para sábado num grupo novo. Você não está no grupo.',
        choices: [
          { text: 'Mandar mensagem para sua melhor amizade perguntando o que rolou', effects: { medo: 1, ansiedade: 1 }, next: 'pergunta' },
          { text: 'Ficar rolando os stories e comparando sua sexta com a deles', effects: { inveja: 3, tristeza: 1 }, next: 'comparacao' },
          { text: 'Postar uma indireta', effects: { raiva: 3 }, next: 'indireta' },
        ],
      },
      pergunta: {
        text: 'A mensagem é visualizada... e nada de resposta. Os três pontinhos aparecem e somem.',
        choices: [
          { text: 'Imaginar mil motivos para estarem te excluindo', effects: { ansiedade: 3 }, next: 'resposta' },
          { text: 'Largar o celular e fazer outra coisa enquanto espera', effects: { alegria: 1, tedio: 1 }, next: 'resposta' },
        ],
      },
      comparacao: {
        text: 'Quanto mais você rola, mais parece que todo mundo tem uma vida incrível — menos você.',
        choices: [
          { text: 'Lembrar que stories mostram só os melhores momentos', effects: { inveja: 1, alegria: 1 }, next: 'noite' },
          { text: 'Rever fotos antigas com essa turma', effects: { nostalgia: 2, tristeza: 1 }, next: 'noite' },
          { text: 'Achar tudo aquilo forçado e meio ridículo', effects: { nojinho: 2, inveja: 1 }, next: 'noite' },
        ],
      },
      indireta: {
        text: 'Você posta: "Bom saber quem são os amigos de verdade". Em poucos minutos, alguém do grupo reage com 👀.',
        choices: [
          { text: 'Apagar o post, com o rosto pegando fogo', effects: { vergonha: 3 }, next: 'conversa' },
          { text: 'Deixar lá. Eles mereceram!', effects: { raiva: 2, nojinho: 1 }, next: 'conversa' },
        ],
      },
      noite: {
        text: 'Já é tarde quando o celular vibra. É a sua melhor amizade.',
        choices: [{ text: 'Abrir a mensagem', effects: { ansiedade: 1 }, next: 'resposta' }],
      },
      resposta: {
        text: '"Foi mal!! Criaram o grupo correndo e esqueceram de te adicionar. Vou te colocar agora. Bora amanhã?"',
        choices: [
          { text: 'Responder "bora!!" com alívio', effects: { alegria: 3 }, next: 'fim' },
          { text: 'Contar, com calma, que aquilo te chateou', effects: { tristeza: 1, raiva: 1, alegria: 1 }, next: 'fim' },
          { text: 'Ir, mas com o pé atrás', effects: { medo: 1, inveja: 1 }, next: 'fim' },
        ],
      },
      conversa: {
        text: 'No dia seguinte, alguém do grupo te chama: "Vi seu post. A gente esqueceu de te adicionar, desculpa. Ficou com raiva da gente?"',
        choices: [
          { text: 'Admitir: "Fiquei, sim. Me senti de fora."', effects: { tristeza: 2, raiva: 1 }, next: 'fim' },
          { text: 'Dizer que foi só brincadeira', effects: { vergonha: 2, medo: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'No fim, era um mal-entendido — mas o que você sentiu foi real. Ficar de fora dói, e a raiva, a inveja ou o medo apareceram para te mostrar que pertencer importa para você.',
      },
    },
  },
  {
    id: 'vespera-da-prova',
    title: 'Véspera da prova',
    tagline: 'Amanhã tem prova difícil e você ainda nem abriu o caderno.',
    icon: '📚',
    cover: 'ansiedade',
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Amanhã tem prova de matemática, a mais difícil do bimestre. São 20h e você ainda não começou a estudar.',
        choices: [
          { text: 'Abrir o caderno e montar um plano rápido', effects: { ansiedade: 1, alegria: 1 }, next: 'estudo' },
          { text: 'Só mais um vídeo antes de começar...', effects: { tedio: 2, medo: 1 }, next: 'procrastina' },
          { text: 'Sentir o coração disparar só de pensar na prova', effects: { ansiedade: 3, medo: 1 }, next: 'panico' },
        ],
      },
      estudo: {
        text: 'Você começa bem, mas trava num exercício. Tenta de novo e erra de novo.',
        choices: [
          { text: 'Jogar o lápis longe: "Eu não sirvo pra isso!"', effects: { raiva: 2, vergonha: 1 }, next: 'ajuda' },
          { text: 'Pedir ajuda no grupo da turma', effects: { medo: 1, alegria: 1 }, next: 'ajuda' },
          { text: 'Pular o exercício e seguir para os próximos', effects: { ansiedade: 1, tedio: 1 }, next: 'noite' },
        ],
      },
      procrastina: {
        text: 'Um vídeo virou dez. Já são 22h. Uma amiga posta: "Revisei tudo, tô pronta!"',
        choices: [
          { text: 'Sentir uma pontada: por que ela consegue e eu não?', effects: { inveja: 3 }, next: 'panico' },
          { text: 'Pensar "tanto faz, já era"', effects: { tedio: 2, tristeza: 1 }, next: 'panico' },
        ],
      },
      panico: {
        text: 'O peito aperta, a respiração fica curta e a cabeça só repete: "e se eu tirar zero?"',
        choices: [
          { text: 'Fazer a respiração 4-4-4: inspirar, segurar, soltar', effects: { ansiedade: 1, alegria: 1 }, next: 'noite' },
          { text: 'Contar para alguém da família como você está se sentindo', effects: { tristeza: 1, medo: 1 }, next: 'noite' },
          { text: 'Ficar remoendo tudo no escuro', effects: { ansiedade: 2, medo: 2 }, next: 'noite' },
        ],
      },
      ajuda: {
        text: 'Uma colega manda um áudio explicando o exercício. De repente, tudo faz sentido!',
        choices: [
          { text: 'Agradecer e seguir estudando com energia', effects: { alegria: 3 }, next: 'noite' },
          { text: 'Sentir vergonha por ter precisado de ajuda', effects: { vergonha: 2 }, next: 'noite' },
        ],
      },
      noite: {
        text: 'Na hora de dormir, você lembra de uma prova do ano passado em que foi bem, mesmo depois de muito nervosismo.',
        choices: [
          { text: 'Sorrir com a lembrança', effects: { nostalgia: 2, alegria: 1 }, next: 'fim' },
          { text: 'Pensar que desta vez vai ser diferente — para pior', effects: { medo: 2, ansiedade: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'A prova chegou e passou. Seja qual for a nota, ela mede um dia, não quem você é. A ansiedade tentou te preparar — às vezes ela só precisa de um pouco menos de volume.',
      },
    },
  },
  {
    id: 'a-festa',
    title: 'A festa de 16 anos',
    tagline: 'Música alta, pista de dança e a chance de pagar mico.',
    icon: '🎉',
    cover: 'vergonha',
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Chegou o convite para a festa de 16 anos da Duda. Todo mundo vai. Você abre o guarda-roupa e nada parece bom o suficiente.',
        choices: [
          { text: 'Pegar sua roupa favorita, mesmo não sendo nova', effects: { alegria: 2, nostalgia: 1 }, next: 'chegada' },
          { text: 'Ver o que os outros vão usar e se sentir para trás', effects: { inveja: 2, ansiedade: 1 }, next: 'chegada' },
          { text: 'Pensar em nem ir', effects: { medo: 2, tristeza: 1 }, next: 'decidir' },
        ],
      },
      decidir: {
        text: 'Sua prima diz: "Vai, sim! Se ficar ruim, me liga que eu te busco."',
        choices: [
          { text: 'Topar ir, com esse plano B no bolso', effects: { medo: 1, alegria: 1 }, next: 'chegada' },
          { text: 'Ficar em casa vendo filme', effects: { tedio: 1, tristeza: 1 }, next: 'casa' },
        ],
      },
      chegada: {
        text: 'Na festa, a música está alta. Alguém te puxa para a pista de dança, na frente de todo mundo.',
        choices: [
          { text: 'Dançar do seu jeito, sem pensar muito', effects: { alegria: 3 }, next: 'mico' },
          { text: 'Travar e sair de fininho', effects: { vergonha: 3 }, next: 'canto' },
          { text: 'Revirar os olhos: essa música é horrível', effects: { nojinho: 3 }, next: 'canto' },
        ],
      },
      mico: {
        text: 'No meio da dança, você tropeça e quase cai. Algumas pessoas riem — e alguém está filmando.',
        choices: [
          { text: 'Rir junto e fazer uma reverência', effects: { alegria: 2, vergonha: 1 }, next: 'fim' },
          { text: 'Querer sumir do planeta', effects: { vergonha: 3 }, next: 'fim' },
          { text: 'Pedir com firmeza para apagarem o vídeo', effects: { raiva: 2 }, next: 'fim' },
        ],
      },
      canto: {
        text: 'No canto, você encontra o Theo, que também parece meio deslocado. Ele está no terceiro brigadeiro.',
        choices: [
          { text: 'Puxar conversa (e pegar um brigadeiro também)', effects: { alegria: 2 }, next: 'fim' },
          { text: 'Ficar no celular até dar a hora de ir embora', effects: { tedio: 2 }, next: 'fim' },
        ],
      },
      casa: {
        text: 'Em casa, você vê os stories da festa. Parece estar divertido.',
        choices: [
          { text: 'Sentir um pouco de inveja e um pouco de alívio, tudo junto', effects: { inveja: 2, alegria: 1 }, next: 'fim' },
          { text: 'Rever fotos de festas antigas', effects: { nostalgia: 3 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Festas misturam muita coisa: vontade de pertencer, medo de pagar mico, comparação... Sentir várias emoções ao mesmo tempo é completamente normal.',
      },
    },
  },
  {
    id: 'domingo',
    title: 'Domingo sem nada',
    tagline: 'Sem bateria, sem plano e com a tarde inteira pela frente.',
    icon: '🛋️',
    cover: 'tedio',
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Domingo, 15h. O celular descarregou e o carregador quebrou. Não tem nada para fazer.',
        choices: [
          { text: 'Deitar no sofá e encarar o teto', effects: { tedio: 3 }, next: 'teto' },
          { text: 'Mexer nas caixas antigas do armário', effects: { nostalgia: 2, alegria: 1 }, next: 'caixa' },
          { text: 'Reclamar com todo mundo da casa', effects: { raiva: 2, tedio: 1 }, next: 'familia' },
        ],
      },
      teto: {
        text: 'Depois de um tempo olhando para o nada, sua cabeça começa a viajar em ideias.',
        choices: [
          { text: 'Pegar um papel e desenhar ou escrever o que veio', effects: { alegria: 2, tedio: 1 }, next: 'fim' },
          { text: 'Lembrar das coisas que você fazia quando era criança', effects: { nostalgia: 2 }, next: 'caixa' },
        ],
      },
      caixa: {
        text: 'Você encontra um caderno de quando tinha 10 anos, com uma lista de sonhos: "ser astronauta, ter um cachorro, ficar famoso na internet".',
        choices: [
          { text: 'Rir com carinho de quem você era', effects: { alegria: 2, nostalgia: 1 }, next: 'fim' },
          { text: 'Sentir saudade de quando tudo parecia mais simples', effects: { nostalgia: 2, tristeza: 2 }, next: 'fim' },
          { text: 'Achar tudo muito cringe e esconder o caderno', effects: { vergonha: 2, nojinho: 1 }, next: 'fim' },
        ],
      },
      familia: {
        text: 'Sua avó ouve a reclamação e diz: "Tédio? No meu tempo a gente inventava brincadeira!" — e te chama para fazer um bolo.',
        choices: [
          { text: 'Topar, meio sem vontade', effects: { tedio: 1, alegria: 1 }, next: 'cozinha' },
          { text: 'Ficar com raiva do sermão', effects: { raiva: 2 }, next: 'fim' },
          { text: 'Fazer careta: mexer em massa crua? Eca!', effects: { nojinho: 3 }, next: 'cozinha' },
        ],
      },
      cozinha: {
        text: 'Vocês fazem o bolo da receita da bisavó, e sua avó conta histórias de quando era adolescente.',
        choices: [
          { text: 'Perguntar mais sobre a juventude dela', effects: { nostalgia: 2, alegria: 2 }, next: 'fim' },
          { text: 'Comer o bolo em silêncio, curtindo o momento', effects: { alegria: 2 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'O tédio parece inútil, mas é muitas vezes nele que a criatividade aparece. E a nostalgia nos conecta com quem fomos — e com quem amamos.',
      },
    },
  },
]

const BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s]))

export const getStory = (id: string): Story | undefined => BY_ID[id]
