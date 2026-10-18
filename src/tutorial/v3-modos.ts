// Vídeo 3 de 4: voto secreto, abstenção e os outros modos de votação.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const V3: VideoTutorial = {
  id: "Tutorial3-Modos",
  numero: 3,
  titulo: "Outros modos",
  cenas: [
    {
      id: "T3-01-Abertura",
      nome: "Abertura",
      fala:
        "Este vídeo mostra o voto secreto, a abstenção e os outros jeitos de votar. Você escolhe o modo na hora de colocar a pauta em votação.",
      cartao: {
        titulo: "Outros modos de votação",
        subtitulo: "Tutorial da secretária · parte 3 de 4",
      },
      planos: [],
    },
    {
      id: "T3-02-Secreto",
      nome: "Voto secreto",
      fala:
        "{secreto} O voto secreto já vem marcado. Desmarque só quando a comissão quiser o voto de cada um à vista, no telão, no painel e na ata. " +
        "{telao} Com o voto secreto, o telão e o painel mostram só quem votou, sem o voto de cada um. " +
        "{resultado} No fim, aparecem só o placar e o resultado. " +
        "{nominais} O voto de cada pessoa não entra na ata e fica guardado para a secretaria, nos Votos nominais.",
      planos: [
        {
          em: "secreto",
          layout: "painel",
          painel: "painel-secreto-marcado",
          foco: "painel-secreto-marcado#form",
          zoom: 1.6,
          destaque: "painel-secreto-marcado#secreto",
          rotulo: "Voto secreto marcado",
        },
        {
          // painel e telão do mesmo instante da votação secreta: "VOTOU" no lugar do voto
          em: "telao",
          layout: "painel+telao",
          painel: "painel-secreta-aberta",
          foco: "painel-secreta-aberta#agora",
          zoom: 1.4,
          telao: "telao-secreta-aberta",
          destaque: "telao-secreta-aberta#grade",
          rotulo: "Só quem votou",
        },
        {
          em: "resultado",
          layout: "telao",
          telao: "telao-secreta-resultado",
          destaque: "telao-secreta-resultado#resultado",
          rotulo: "Só o resultado",
        },
        {
          em: "nominais",
          layout: "folha",
          folha: "folha-votos-nominais",
          foco: "folha-votos-nominais#capa",
          zoom: 1,
          rotulo: "Votos nominais",
        },
      ],
    },
    {
      id: "T3-03-Abstencao",
      nome: "Abstenção",
      fala:
        "{abster} Daqui em diante, nos exemplos, o voto é aberto. Em qualquer modo, quem não quiser votar toca em Me abstenho. " +
        "{telao} Quem se abstém conta como quem já votou, mas a abstenção não vai para nenhum nome e aparece à parte na contagem. " +
        "{painel} No painel, clique em Abstenção na linha de quem está sem celular.",
      planos: [
        {
          em: "abster",
          layout: "celular",
          celular: "celular-simnao",
          toque: "celular-simnao#abster",
          destaque: "celular-simnao#abster",
          rotulo: "Me abstenho",
        },
        {
          // só a Ana mudou: de 5 para 6 votos, com 1 abstenção
          em: "telao",
          layout: "celular+telao",
          celular: "celular-abstencao",
          telao: "telao-abstencao",
          destaque: "telao-abstencao#contagem",
          rotulo: "Conta como voto",
        },
        {
          em: "painel",
          layout: "painel",
          painel: "painel-registrar-abstencao",
          foco: "painel-registrar-abstencao#linha",
          zoom: 1.6,
          cursor: "painel-registrar-abstencao#abstencao",
          destaque: "painel-registrar-abstencao#abstencao",
          rotulo: "Abstenção no painel",
        },
      ],
    },
    {
      id: "T3-04-Ordem",
      nome: "Ordenar os nomes",
      fala:
        "{modo} No modo Ordenar os nomes, cada membro põe todos os nomes em ordem. " +
        "{celular} No celular, a pessoa usa as setas para subir ou descer cada nome. " +
        "{enviar} Depois toca em Enviar minha ordem. " +
        "{resultado} Vence quem tiver a menor média de posição, ou seja, quem ficou, na média, mais perto do primeiro lugar.",
      planos: [
        {
          em: "modo",
          layout: "painel",
          painel: "painel-modo-ordem",
          foco: "painel-modo-ordem#form",
          zoom: 1.6,
          destaque: "painel-modo-ordem#modo",
          rotulo: "Ordenar os nomes",
        },
        {
          em: "celular",
          layout: "celular",
          celular: "celular-ordem",
          toque: "celular-ordem#subir",
          destaque: "celular-ordem#lista",
          rotulo: "Setas para ordenar",
        },
        {
          em: "enviar",
          celular: "celular-ordem-mexida",
          toque: "celular-ordem-mexida#enviar",
          destaque: "celular-ordem-mexida#enviar",
          rotulo: "Enviar minha ordem",
        },
        {
          em: "resultado",
          layout: "telao",
          telao: "telao-ordem-resultado",
          destaque: "telao-ordem-resultado#rodape",
          rotulo: "Menor média vence",
        },
      ],
    },
    {
      id: "T3-05-Eliminacao",
      nome: "Eliminação por rodadas",
      fala:
        "{modo} Na eliminação, cada membro escolhe um nome por rodada, e você encerra cada rodada como de costume. " +
        "{semmaioria} Se ninguém passar da metade dos votos, o painel já marca os mais votados. " +
        "{abrir} Confira e clique em Abrir a segunda rodada. " +
        "{segunda} Os membros votam de novo, só nesses nomes. " +
        "{eleito} Repita até alguém ter a maioria.",
      planos: [
        {
          em: "modo",
          layout: "painel",
          painel: "painel-modo-eliminacao",
          foco: "painel-modo-eliminacao#form",
          zoom: 1.6,
          destaque: "painel-modo-eliminacao#modo",
          rotulo: "Eliminação por rodadas",
        },
        {
          // só o painel, de perto: os dois nomes que ele já marcou
          em: "semmaioria",
          painel: "painel-eliminacao-proxima",
          foco: "painel-eliminacao-proxima#sugeridos",
          zoom: 1.6,
          destaque: "painel-eliminacao-proxima#sugeridos",
          rotulo: "Os mais votados marcados",
        },
        {
          em: "abrir",
          foco: "painel-eliminacao-proxima#abrir",
          // 1.52: a borda de cima cai entre duas linhas de texto, sem cortar nenhuma
          zoom: 1.52,
          cursor: "painel-eliminacao-proxima#abrir",
          clique: true,
          destaque: "painel-eliminacao-proxima#abrir",
          rotulo: "Abrir a 2ª rodada",
        },
        {
          em: "segunda",
          layout: "telao",
          telao: "telao-eliminacao-r2",
          destaque: "telao-eliminacao-r2#topo",
          rotulo: "Segunda rodada",
        },
        {
          em: "eleito",
          telao: "telao-eliminacao-eleito",
          destaque: "telao-eliminacao-eleito#resultado",
          rotulo: "Até ter maioria",
        },
      ],
    },
    {
      id: "T3-06-Comissao",
      nome: "Escolha da comissão",
      fala:
        "{comissao} Na eliminação, a rodada terminou sem maioria, mas a comissão decidiu por um nome? " +
        "{escolher} Cada nome tem um botão que começa com Comissão escolheu. Clique no botão do nome escolhido e confirme. " +
        "{resultado} O telão mostra Eleito pela comissão, e a ata registra isso. Depois, registre o resultado como de costume.",
      planos: [
        {
          em: "comissao",
          layout: "painel",
          painel: "painel-comissao",
          foco: "painel-comissao#grupo",
          zoom: 1.4,
          destaque: "painel-comissao#rodada",
          rotulo: "Votos espalhados",
        },
        {
          em: "escolher",
          cursor: "painel-comissao#otavio",
          clique: true,
          destaque: "painel-comissao#otavio",
          dialogo: { captura: "painel-comissao" },
          rotulo: "Comissão escolheu",
        },
        {
          em: "resultado",
          layout: "telao",
          telao: "telao-comissao",
          destaque: "telao-comissao#resultado",
          rotulo: "Eleito pela comissão",
        },
      ],
    },
    {
      id: "T3-07-Varios",
      nome: "Escolher vários nomes",
      fala:
        "{modo} No modo de escolher vários nomes, você define quantos nomes cada membro pode marcar. " +
        "{celular} No celular, a pessoa marca os nomes e toca em Confirmar. Sem marcar ninguém, o voto fica em branco, que neste modo é a abstenção. " +
        "{resultado} O resultado mostra a lista, do mais votado ao menos votado.",
      planos: [
        {
          em: "modo",
          layout: "painel",
          painel: "painel-modo-multipla",
          foco: "painel-modo-multipla#modo",
          zoom: 1.6,
          destaque: "painel-modo-multipla#max",
          rotulo: "Quantos nomes marcar",
        },
        {
          em: "celular",
          layout: "celular",
          celular: "celular-multipla",
          toque: "celular-multipla#confirmar",
          destaque: "celular-multipla#confirmar",
          rotulo: "Marcar e confirmar",
        },
        {
          em: "resultado",
          layout: "telao",
          telao: "telao-multipla-resultado",
          destaque: "telao-multipla-resultado#rodape",
          rotulo: "Lista por votos",
        },
      ],
    },
    {
      id: "T3-08-Fim",
      nome: "Fim",
      fala:
        "{fim} No último vídeo, o que fazer depois da reunião, com os líderes, a ata e o feedback.",
      cartao: {
        titulo: "Outros modos de votação",
        subtitulo: "Próximo vídeo: depois da reunião",
      },
      planos: [],
    },
  ],
};
