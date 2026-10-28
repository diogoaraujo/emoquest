import type { ReactNode } from 'react'

const CONTACT = (import.meta.env.VITE_PRIVACY_CONTACT as string | undefined) || 'o canal de contato informado por quem mantém esta instalação do EmoQuest'

function S({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 ring-1 ring-ink/5 sm:p-6">
      <h2 className="font-display text-xl font-extrabold">{title}</h2>
      <div className="mt-2 space-y-2 text-[1.0625rem] leading-relaxed text-ink/85">{children}</div>
    </section>
  )
}

/** Política de privacidade (modelo). Deve ser revisada pela instituição/encarregado(a) antes do uso em produção. */
export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6 pb-10">
      <h1 className="font-display text-[2rem] leading-tight font-extrabold">Privacidade e proteção de dados</h1>
      <p className="text-lg text-ink/80">
        Explicamos aqui, em linguagem simples, como o EmoQuest trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD)
        e com atenção especial a adolescentes.
      </p>

      <S title="Quem é quem">
        <p>
          <strong>Responsável pela sala</strong> (professor, psicólogo ou profissional que cria a sala): decide aplicar a atividade e para qual finalidade.
          Atua como <strong>controlador</strong> dos dados do seu grupo, normalmente em nome da instituição em que trabalha.
        </p>
        <p>
          <strong>EmoQuest</strong> (quem mantém esta instalação): fornece a plataforma e trata os dados conforme as instruções do controlador, como{' '}
          <strong>operador</strong>.
        </p>
      </S>

      <S title="Quais dados tratamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Responsáveis:</strong> nome, e-mail e senha (guardada apenas como hash criptográfico).
          </li>
          <li>
            <strong>Participantes:</strong> nome ou apelido, <em>opcional</em>; escolhas feitas nas atividades; resultados emocionais; data e hora. Não pedimos e-mail,
            telefone, documento, foto nem localização, e não há campos de texto livre.
          </li>
          <li>
            Os resultados emocionais podem revelar aspectos da vida emocional de adolescentes. Por isso, tratamos esses dados com o mesmo cuidado aplicado a dados
            sensíveis.
          </li>
        </ul>
      </S>

      <S title="Para que usamos e com qual base legal">
        <p>
          Exclusivamente para atividades educativas de inteligência emocional e para o acompanhamento coletivo do grupo por quem o conduz. Nunca para publicidade,
          perfilamento comercial, avaliação escolar ou decisões automatizadas sobre o jovem.
        </p>
        <p>
          Seguimos o <strong>melhor interesse do adolescente</strong> (art. 14 da LGPD). Ao criar uma sala, o responsável declara ter autorização da instituição e,
          quando necessário, dos responsáveis legais. Ao entrar, cada participante recebe estas informações de forma clara e manifesta sua concordância. A base legal
          adequada (consentimento, execução de políticas educacionais, entre outras) deve ser definida pela instituição; recomendamos avaliação pelo(a)
          encarregado(a) de dados.
        </p>
      </S>

      <S title="Quem pode ver o quê">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Nomes e respostas individuais:</strong> somente o responsável pela sala. Cada acesso a esses dados fica registrado.
          </li>
          <li>
            <strong>Participantes e visualizadores do painel compartilhado:</strong> somente resultados agregados e anonimizados da turma.
          </li>
          <li>Não vendemos nem compartilhamos dados com terceiros.</li>
        </ul>
      </S>

      <S title="Como protegemos contra reidentificação">
        <ul className="list-disc space-y-1 pl-5">
          <li>Dados de identificação (nomes) ficam em tabela separada; os gráficos usam apenas totais estatísticos, sem identificadores.</li>
          <li>
            Resultados de grupo só aparecem para outras pessoas com no mínimo <strong>5 participantes</strong> (ou o valor maior definido pela sala).
          </li>
          <li>Só aparecem depois que a sessão é encerrada, para que ninguém descubra o resultado de alguém comparando o antes e o depois.</li>
          <li>Emoções escolhidas por menos de 3 pessoas ficam ocultas, e números são arredondados.</li>
          <li>Links de sala e de painel usam códigos aleatórios, não contêm dados pessoais e podem ser trocados ou desativados a qualquer momento.</li>
        </ul>
      </S>

      <S title="Por quanto tempo guardamos">
        <p>
          Os dados individuais ficam guardados pelo prazo definido em cada sala, de 30 a 730 dias (padrão: 365). Depois disso são apagados automaticamente. Ficam
          apenas totais anônimos de sessões com participantes suficientes. Excluir uma sala ou a conta apaga imediatamente todos os dados ligados a ela.
        </p>
      </S>

      <S title="Seus direitos">
        <p>
          Você pode confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir a exclusão e revogar o consentimento (art. 18 da LGPD). Participantes podem
          apagar a própria participação a qualquer momento, na página da sala, ou pedir ao responsável. Também é possível falar com {CONTACT}, ou reclamar à
          Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </S>

      <S title="Segurança">
        <p>
          Comunicação criptografada (HTTPS), senhas com hash e sal, tokens de acesso guardados só como hash, limite de tentativas de login, isolamento de dados por
          sala e por conta, e registro de acessos a dados identificáveis.
        </p>
      </S>

      <p className="text-sm text-ink/70">Versão 2026-10. Este texto é um modelo e deve ser revisado pela instituição antes do uso.</p>
    </div>
  )
}
