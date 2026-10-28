import type { Story, Theme, ThemeId } from '../types'

export const STORIES: Story[] = [
  {
    id: 'escola-nova',
    title: 'Primeiro dia na escola nova',
    tagline: 'Sala nova, gente nova e aquele frio na barriga.',
    icon: '🏫',
    cover: 'medo',
    themes: ['escola'],
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
    themes: ['amizades', 'quem-sou'],
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
    themes: ['escola'],
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
    themes: ['amizades', 'tempo-livre'],
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
    themes: ['tempo-livre'],
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
  {
    id: 'o-show',
    title: 'Não é justo!',
    tagline: 'Sua banda favorita vem para a cidade, e a resposta em casa é "não".',
    icon: '🏠',
    cover: 'raiva',
    themes: ['familia'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Sua banda favorita vai fazer show na cidade. Você pede para ir com os amigos, e seus pais respondem: "Não, você ainda não tem idade para isso." Só que sua irmã mais velha foi a um show com a mesma idade que você tem agora.',
        choices: [
          { text: 'Gritar "não é justo!" e bater a porta do quarto', effects: { raiva: 3 }, next: 'quarto' },
          { text: 'Lembrar da sua irmã e sentir aquela pontada', effects: { inveja: 2, tristeza: 1 }, next: 'quarto' },
          { text: 'Respirar e tentar negociar com calma', effects: { ansiedade: 1, alegria: 1 }, next: 'negociar' },
        ],
      },
      quarto: {
        text: 'Do quarto, você ouve seus pais conversando baixinho na cozinha. Parece que estão preocupados com dinheiro.',
        choices: [
          { text: 'Sentir um peso por ter gritado', effects: { vergonha: 2, tristeza: 1 }, next: 'irma' },
          { text: 'Continuar com raiva: "sempre arranjam uma desculpa"', effects: { raiva: 2 }, next: 'irma' },
          { text: 'Ouvir a banda e lembrar de quando a família ia junta a shows na praça', effects: { nostalgia: 2, tristeza: 1 }, next: 'irma' },
        ],
      },
      negociar: {
        text: 'Você propõe ir com um adulto, voltar no horário combinado e mandar mensagem a cada hora. Seus pais trocam um olhar.',
        choices: [
          { text: 'Esperar a resposta com o coração acelerado', effects: { ansiedade: 2 }, next: 'irma' },
          { text: 'Continuar argumentando sem parar', effects: { raiva: 1, ansiedade: 1 }, next: 'irma' },
        ],
      },
      irma: {
        text: 'Sua irmã bate na porta: "Sabia que eu também briguei para ir naquele show? E que o ingresso foi presente da madrinha?"',
        choices: [
          { text: 'Rir e perceber que vocês se parecem mais do que você imaginava', effects: { alegria: 2 }, next: 'decisao' },
          { text: 'Desconfiar: ela sempre foi a preferida', effects: { inveja: 1, medo: 1 }, next: 'decisao' },
          { text: 'Achar que ela está se achando', effects: { nojinho: 2 }, next: 'decisao' },
        ],
      },
      decisao: {
        text: 'No jantar, seus pais dizem: "Desta vez não dá. Mas queremos combinar algo que caiba no bolso e deixe todo mundo tranquilo."',
        choices: [
          { text: 'Aceitar, mesmo com o coração apertado', effects: { tristeza: 1, alegria: 1 }, next: 'fim' },
          { text: 'Pedir desculpa pela porta batida', effects: { vergonha: 1, alegria: 1 }, next: 'fim' },
          { text: 'Dizer que eles nunca entendem nada', effects: { raiva: 2, tristeza: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Família briga, discorda e se ama ao mesmo tempo. Dizer o que você sente — e escutar o outro lado — é o que faz a raiva virar conversa.',
      },
    },
  },
  {
    id: 'coracao-acelerado',
    title: 'Coração acelerado',
    tagline: 'Uma paixão, um lápis emprestado e uma piada que não tem graça.',
    icon: '💘',
    cover: 'ansiedade',
    themes: ['amor'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Faz semanas que a Cami não sai da sua cabeça. Hoje ela sentou do seu lado na aula de artes e pediu seu lápis emprestado.',
        choices: [
          { text: 'Emprestar e puxar assunto sobre o desenho dela', effects: { alegria: 2, ansiedade: 1 }, next: 'conversa' },
          { text: 'Travar, com o rosto pegando fogo', effects: { vergonha: 2, medo: 1 }, next: 'amigos' },
          { text: 'Fingir que nem ligou', effects: { medo: 1, tedio: 1 }, next: 'amigos' },
        ],
      },
      conversa: {
        text: 'Vocês passam o resto da aula rindo. À noite, ela começa a te seguir nas redes.',
        choices: [
          { text: 'Mandar uma mensagem sobre a aula', effects: { alegria: 2, ansiedade: 1 }, next: 'amigos' },
          { text: 'Ficar relendo o perfil dela sem coragem de escrever', effects: { ansiedade: 2 }, next: 'amigos' },
        ],
      },
      amigos: {
        text: 'No intervalo, a galera comenta quem está a fim de quem. Aí alguém vê dois meninos de mãos dadas no pátio e solta uma piada preconceituosa. Algumas pessoas riem.',
        choices: [
          { text: 'Dizer: "Isso não tem graça nenhuma"', effects: { raiva: 2, medo: 1 }, next: 'confidencia' },
          { text: 'Rir sem graça para não destoar', effects: { vergonha: 2, nojinho: 1 }, next: 'depois' },
          { text: 'Ficar em silêncio, com revolta por dentro', effects: { nojinho: 2, raiva: 1 }, next: 'depois' },
        ],
      },
      confidencia: {
        text: 'O clima fica estranho por um segundo. Depois, sua melhor amizade te puxa de canto: "Valeu por falar. Posso te contar uma coisa? Eu gosto de alguém do mesmo gênero que eu."',
        choices: [
          { text: 'Dar um abraço e agradecer pela confiança', effects: { alegria: 3 }, next: 'fim' },
          { text: 'Não saber o que dizer, mas continuar ali', effects: { ansiedade: 1, alegria: 1 }, next: 'fim' },
        ],
      },
      depois: {
        text: 'À noite, você não consegue parar de pensar na piada — e em quem estava ouvindo.',
        choices: [
          { text: 'Conversar com alguém de confiança sobre isso', effects: { tristeza: 1, alegria: 1 }, next: 'fim' },
          { text: 'Prometer a si que, da próxima vez, vai falar algo', effects: { vergonha: 1, raiva: 1 }, next: 'fim' },
          { text: 'Lembrar da aula de artes e sorrir no escuro', effects: { alegria: 2 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Gostar de alguém mexe com tudo: alegria, vergonha, frio na barriga. E todo mundo merece viver isso sem medo de virar piada — inclusive você.',
      },
    },
  },
  {
    id: 'a-foto',
    title: 'A foto',
    tagline: 'Uma foto de que você gostou... até começar a reparar em tudo.',
    icon: '🤳',
    cover: 'vergonha',
    themes: ['quem-sou'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Você tirou uma foto de que gostou muito. Mas, antes de postar, começa a reparar em cada detalhe: o cabelo, o sorriso, o corpo.',
        choices: [
          { text: 'Postar do jeito que está', effects: { alegria: 2, ansiedade: 1 }, next: 'postou' },
          { text: 'Colocar filtros até ficar "perfeita"', effects: { vergonha: 2, ansiedade: 1 }, next: 'filtro' },
          { text: 'Desistir e ir ver fotos de influenciadores', effects: { inveja: 3 }, next: 'comparar' },
        ],
      },
      filtro: {
        text: 'Depois de meia hora editando, a foto nem parece mais você.',
        choices: [
          { text: 'Postar mesmo assim', effects: { vergonha: 1, ansiedade: 1 }, next: 'postou' },
          { text: 'Voltar para a original', effects: { alegria: 1, medo: 1 }, next: 'postou' },
        ],
      },
      comparar: {
        text: 'Corpos "perfeitos", viagens, roupas caras. Você se olha no espelho e sente um nó na garganta.',
        choices: [
          { text: 'Lembrar que muita coisa ali é edição e ângulo', effects: { inveja: 1, alegria: 1 }, next: 'amizade' },
          { text: 'Largar o celular e colocar sua música favorita', effects: { alegria: 1, tedio: 1 }, next: 'amizade' },
          { text: 'Se sentir pior a cada foto', effects: { tristeza: 2, vergonha: 1 }, next: 'amizade' },
        ],
      },
      postou: {
        text: 'Uma hora depois: poucas curtidas. E um comentário de alguém da sala: "kkkk que pose é essa?"',
        choices: [
          { text: 'Apagar a foto na hora', effects: { vergonha: 3 }, next: 'amizade' },
          { text: 'Responder com outra provocação', effects: { raiva: 2, nojinho: 1 }, next: 'amizade' },
          { text: 'Pensar: "eu gostei da foto, e isso basta"', effects: { alegria: 2 }, next: 'amizade' },
        ],
      },
      amizade: {
        text: 'Sua melhor amizade te manda mensagem: "Vi sua foto. Você estava muito você nela, sabia?"',
        choices: [
          { text: 'Agradecer e sentir o peito mais leve', effects: { alegria: 2 }, next: 'fim' },
          { text: 'Contar que anda se cobrando demais com a aparência', effects: { tristeza: 1, alegria: 1 }, next: 'fim' },
          { text: 'Desconversar', effects: { vergonha: 1, medo: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Curtidas medem um algoritmo, não o seu valor. Ser você — com seu corpo, seus gostos e seu jeito — é algo que nenhum filtro consegue melhorar.',
      },
    },
  },
  {
    id: 'primeiro-trampo',
    title: 'O primeiro trampo',
    tagline: 'Uma entrevista, um "não" e a vontade de ter o próprio dinheiro.',
    icon: '💼',
    cover: 'ansiedade',
    themes: ['futuro'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Você conseguiu uma entrevista para jovem aprendiz numa loja. É a chance de ganhar seu próprio dinheiro. A entrevista é amanhã, às 9h.',
        choices: [
          { text: 'Ensaiar respostas e separar a roupa', effects: { ansiedade: 2, alegria: 1 }, next: 'entrevista' },
          { text: 'Deixar para lá e dormir tarde', effects: { tedio: 1, medo: 1 }, next: 'atraso' },
          { text: 'Passar a noite pensando "e se eu travar?"', effects: { ansiedade: 3 }, next: 'entrevista' },
        ],
      },
      atraso: {
        text: 'Você acorda às 8h40, sai correndo e chega com dois minutos de atraso.',
        choices: [
          { text: 'Pedir desculpas com sinceridade', effects: { vergonha: 2, medo: 1 }, next: 'entrevista' },
          { text: 'Inventar que o ônibus quebrou', effects: { medo: 2, vergonha: 1 }, next: 'entrevista' },
        ],
      },
      entrevista: {
        text: 'Na sala de espera, outro candidato parece muito mais preparado. Lá dentro, a entrevistadora pergunta: "Qual é o seu maior defeito?"',
        choices: [
          { text: 'Responder com sinceridade e contar o que faz para melhorar', effects: { alegria: 1, medo: 1 }, next: 'resultado' },
          { text: 'Travar e responder qualquer coisa', effects: { vergonha: 2, ansiedade: 1 }, next: 'resultado' },
          { text: 'Só conseguir pensar no outro candidato', effects: { inveja: 2, medo: 1 }, next: 'resultado' },
        ],
      },
      resultado: {
        text: 'Dias depois, chega a resposta: desta vez não deu. Mas a loja diz que gostou de você e pode te chamar numa próxima vaga.',
        choices: [
          { text: 'Ficar triste um pouco e depois procurar outras vagas', effects: { tristeza: 2, alegria: 1 }, next: 'dinheiro' },
          { text: 'Pensar: "nunca vou conseguir nada"', effects: { raiva: 2, tristeza: 1 }, next: 'dinheiro' },
          { text: 'Dizer que nem queria tanto assim', effects: { nojinho: 1, tedio: 1 }, next: 'dinheiro' },
        ],
      },
      dinheiro: {
        text: 'No fim de semana, a galera te chama para um rolê caro. Você não tem como pagar.',
        choices: [
          { text: 'Falar a verdade e sugerir outro programa', effects: { vergonha: 1, alegria: 1 }, next: 'fim' },
          { text: 'Inventar que já tem compromisso', effects: { vergonha: 2 }, next: 'fim' },
          { text: 'Ficar em casa lembrando de quando nada disso importava', effects: { nostalgia: 2, tristeza: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Começar a vida profissional é feito de tentativas — e de "nãos" também. Cada entrevista ensina algo, e o seu valor não cabe no seu bolso.',
      },
    },
  },
  {
    id: 'o-video',
    title: 'O vídeo da turma',
    tagline: 'Todo mundo está rindo. Menos uma pessoa.',
    icon: '📹',
    cover: 'nojinho',
    themes: ['respeito'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Alguém da sua sala gravou o Léo tropeçando na escada e jogou no grupo da turma, cheio de figurinhas zoando. O vídeo já tem dezenas de reações.',
        choices: [
          { text: 'Rir e mandar uma figurinha também', effects: { alegria: 1, vergonha: 1 }, next: 'espalhou' },
          { text: 'Achar aquilo nojento', effects: { nojinho: 3 }, next: 'decidir' },
          { text: 'Ter medo de virar o próximo alvo', effects: { medo: 2, ansiedade: 1 }, next: 'decidir' },
        ],
      },
      espalhou: {
        text: 'No dia seguinte, o Léo chega de cabeça baixa. Alguém imita o tropeço no corredor e todo mundo ri.',
        choices: [
          { text: 'Sentir um aperto: você ajudou nisso', effects: { vergonha: 3 }, next: 'decidir' },
          { text: 'Pensar "é só brincadeira, ele supera"', effects: { tedio: 1, medo: 1 }, next: 'decidir' },
        ],
      },
      decidir: {
        text: 'Você percebe que não é a primeira vez: zoam o Léo pelo jeito de falar, pela roupa, pelo cabelo crespo.',
        choices: [
          { text: 'Escrever no grupo: "Gente, para. Isso é cruel."', effects: { raiva: 2, medo: 1 }, next: 'reacao' },
          { text: 'Falar com o Léo em particular', effects: { tristeza: 1, alegria: 1 }, next: 'leo' },
          { text: 'Contar para uma professora', effects: { medo: 1, ansiedade: 1 }, next: 'professora' },
        ],
      },
      reacao: {
        text: 'Alguém responde "nossa, que chato" com um emoji de palhaço. Mas outras duas pessoas apagam as figurinhas.',
        choices: [
          { text: 'Manter sua posição', effects: { raiva: 1, alegria: 1 }, next: 'leo' },
          { text: 'Sentir vergonha e sair do grupo', effects: { vergonha: 2 }, next: 'leo' },
        ],
      },
      professora: {
        text: 'A professora agradece e diz que vai conversar com a turma sem expor o seu nome.',
        choices: [
          { text: 'Sentir alívio', effects: { alegria: 2 }, next: 'leo' },
          { text: 'Ter medo de que descubram', effects: { ansiedade: 2 }, next: 'leo' },
        ],
      },
      leo: {
        text: 'Na saída, você encontra o Léo sozinho. Ele diz: "Valeu. Achei que ninguém ligava."',
        choices: [
          { text: 'Chamar ele para lanchar com você', effects: { alegria: 2 }, next: 'fim' },
          { text: 'Dizer que sente muito por não ter feito nada antes', effects: { tristeza: 2, vergonha: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Não é brincadeira quando só um lado ri. A raiva e o nojo diante de uma injustiça mostram que algo precisa mudar — e uma atitude pequena pode mudar o dia de alguém.',
      },
    },
  },
  {
    id: 'saudade-da-vo',
    title: 'Saudade da vó',
    tagline: 'Um cheiro de bolo, uma noite sem dormir e um pedido de ajuda.',
    icon: '🌧️',
    cover: 'tristeza',
    themes: ['momentos-dificeis', 'familia'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Faz um mês que sua avó morreu. Hoje, no caminho da escola, você sente cheiro de bolo de fubá — igualzinho ao que ela fazia.',
        choices: [
          { text: 'Sorrir lembrando das tardes na casa dela', effects: { nostalgia: 3 }, next: 'escola' },
          { text: 'Sentir o choro subir e segurar', effects: { tristeza: 2, vergonha: 1 }, next: 'escola' },
          { text: 'Sentir raiva: por que tinha que ser ela?', effects: { raiva: 2, tristeza: 1 }, next: 'escola' },
        ],
      },
      escola: {
        text: 'Na aula, todo mundo age normalmente. Um colega reclama que "o dia está um saco", e parece que ninguém entende o que você sente.',
        choices: [
          { text: 'Se isolar no intervalo', effects: { tristeza: 2, tedio: 1 }, next: 'noite' },
          { text: 'Contar para sua melhor amizade como você está', effects: { tristeza: 1, alegria: 1 }, next: 'amizade' },
          { text: 'Se irritar com tudo e com todos', effects: { raiva: 2 }, next: 'noite' },
        ],
      },
      amizade: {
        text: 'Sua amizade escuta sem interromper e diz: "Não sei o que dizer, mas estou aqui."',
        choices: [
          { text: 'Sentir um alívio no peito', effects: { alegria: 2, tristeza: 1 }, next: 'noite' },
          { text: 'Pedir para mudar de assunto', effects: { medo: 1, tristeza: 1 }, next: 'noite' },
        ],
      },
      noite: {
        text: 'À noite, o coração dispara, a respiração fica curta e a cabeça não para. Parece que algo ruim vai acontecer.',
        choices: [
          { text: 'Respirar devagar: puxar o ar contando até 4, soltar contando até 6', effects: { ansiedade: 1, alegria: 1 }, next: 'ajuda' },
          { text: 'Ficar no celular até de madrugada', effects: { ansiedade: 2, tedio: 1 }, next: 'ajuda' },
          { text: 'Achar que tem algo muito errado com você e esconder de todo mundo', effects: { medo: 2, vergonha: 1 }, next: 'ajuda' },
        ],
      },
      ajuda: {
        text: 'De manhã, alguém da sua família repara na sua cara de cansaço e pergunta se você está bem.',
        choices: [
          { text: 'Contar sobre a noite e sobre a saudade', effects: { tristeza: 1, alegria: 1 }, next: 'fim' },
          { text: 'Dizer "tô bem" e mudar de assunto', effects: { medo: 1, vergonha: 1 }, next: 'fim' },
          { text: 'Dar um abraço sem dizer nada', effects: { tristeza: 1, nostalgia: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Luto e ansiedade não têm hora certa para passar, e pedir ajuda é um ato de coragem. Se pesar demais, converse com um adulto de confiança ou ligue 188 (CVV): é de graça e funciona 24 horas.',
      },
    },
  },
  {
    id: 'a-final',
    title: 'A grande final',
    tagline: 'Último minuto, jogo empatado, e o técnico chama você.',
    icon: '🏆',
    cover: 'alegria',
    themes: ['conquistas', 'escola'],
    start: 'inicio',
    nodes: {
      inicio: {
        text: 'Final do interclasses. Falta um minuto, o jogo está empatado e o técnico olha para o banco... e chama você.',
        choices: [
          { text: 'Entrar com o coração na boca', effects: { ansiedade: 2, alegria: 1 }, next: 'jogo' },
          { text: 'Pensar: "e se eu estragar tudo?"', effects: { medo: 3 }, next: 'jogo' },
          { text: 'Se irritar: por que só agora?', effects: { raiva: 2, inveja: 1 }, next: 'jogo' },
        ],
      },
      jogo: {
        text: 'A bola sobra para você, cara a cara com o gol. A torcida grita.',
        choices: [
          { text: 'Chutar no canto', effects: { alegria: 2, ansiedade: 1 }, next: 'gol' },
          { text: 'Tocar para a colega mais bem posicionada', effects: { alegria: 1, medo: 1 }, next: 'gol_time' },
          { text: 'Hesitar um segundo a mais', effects: { medo: 2, ansiedade: 1 }, next: 'erro' },
        ],
      },
      gol: {
        text: 'GOL! A torcida invade a quadra, te levantam nos ombros e todo mundo grita seu nome.',
        choices: [
          { text: 'Comemorar muito', effects: { alegria: 3 }, next: 'premiacao' },
          { text: 'Ficar sem graça com tanta atenção', effects: { vergonha: 2, alegria: 1 }, next: 'premiacao' },
          { text: 'Lembrar das tardes treinando na rua', effects: { nostalgia: 2, alegria: 1 }, next: 'premiacao' },
        ],
      },
      gol_time: {
        text: 'Sua colega marca! Ela corre até você: "Que passe!"',
        choices: [
          { text: 'Comemorar abraçando o time inteiro', effects: { alegria: 3 }, next: 'premiacao' },
          { text: 'Sentir uma pontinha de vontade de ter feito o gol', effects: { inveja: 2, alegria: 1 }, next: 'premiacao' },
        ],
      },
      erro: {
        text: 'A defesa tira a bola. O apito final soa, o jogo vai para os pênaltis... e o seu time perde.',
        choices: [
          { text: 'Chorar no vestiário', effects: { tristeza: 3 }, next: 'premiacao' },
          { text: 'Culpar o juiz', effects: { raiva: 2, nojinho: 1 }, next: 'premiacao' },
          { text: 'Querer sumir', effects: { vergonha: 3 }, next: 'premiacao' },
        ],
      },
      premiacao: {
        text: 'Na premiação, o professor diz: "O que eu vi hoje foi um time que não desistiu." Seus colegas olham para você.',
        choices: [
          { text: 'Sentir orgulho do caminho, não só do resultado', effects: { alegria: 2, nostalgia: 1 }, next: 'fim' },
          { text: 'Achar o discurso meio clichê', effects: { tedio: 1, nojinho: 1 }, next: 'fim' },
        ],
      },
      fim: {
        ending: true,
        text: 'Vencer é incrível, perder dói — e as duas coisas fazem parte. As conquistas que mais marcam são as que mostram do que você é capaz, junto de quem está do seu lado.',
      },
    },
  },
]

const BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s]))

export const getStory = (id: string): Story | undefined => BY_ID[id]

export const THEMES: Theme[] = [
  { id: 'escola', nome: 'Escola', icon: '🎒' },
  { id: 'amizades', nome: 'Amizades', icon: '🤝' },
  { id: 'familia', nome: 'Família', icon: '🏠' },
  {
    id: 'amor',
    nome: 'Amor e sexualidade',
    icon: '💘',
    descricao: 'Paixão, orientação sexual e respeito',
    aviso: 'Fala de paixão, orientação sexual e preconceito. Indicado a partir de 13 anos.',
    sensivel: true,
  },
  { id: 'quem-sou', nome: 'Quem eu sou', icon: '🪞', descricao: 'Identidade, corpo e redes sociais' },
  { id: 'futuro', nome: 'Futuro e trabalho', icon: '💼', descricao: 'Primeiro emprego, escolhas e dinheiro' },
  { id: 'respeito', nome: 'Respeito e diferenças', icon: '✊', descricao: 'Bullying e preconceito' },
  {
    id: 'momentos-dificeis',
    nome: 'Momentos difíceis',
    icon: '🌧️',
    descricao: 'Perdas, luto e ansiedade',
    aviso: 'Se algo pesar, converse com um adulto de confiança ou ligue 188 (CVV), de graça e 24 horas.',
    sensivel: true,
  },
  { id: 'conquistas', nome: 'Esporte e conquistas', icon: '🏆' },
  { id: 'tempo-livre', nome: 'Tempo livre', icon: '🌤️' },
]

export const getTheme = (id: string): Theme | undefined => THEMES.find((t) => t.id === id)

export const storiesByTheme = (themeId: ThemeId): Story[] => STORIES.filter((s) => s.themes.includes(themeId))
