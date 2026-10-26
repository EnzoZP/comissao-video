// Secretária, vídeo 7: a fila de quem levantou a mão para falar.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S07: VideoTutorial = {
  id: "S07-Palavra",
  numero: 7,
  titulo: "Pedir a palavra",
  cenas: [
    {
      id: "S07-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra a fila de quem levantou a mão pelo celular para pedir a palavra.",
      cartao: { titulo: "Pedir a palavra", subtitulo: "Tutorial da secretária · vídeo 7" },
      planos: [],
    },
    {
      id: "S07-02-Fila",
      nome: "A fila da palavra",
      fala:
        "{celular} Fora da votação, cada membro tem no celular o botão Levantar a mão para falar. " +
        "{telao} O telão mostra a fila numa faixa embaixo, na ordem em que as mãos subiram. " +
        "{painel} O painel mostra a mesma fila no topo do bloco Agora. " +
        "{falou} Dê a palavra ao primeiro. Quando ele terminar, clique em Já falou ao lado do nome. " +
        "{seguinte} Ele sai da fila, e o seguinte vira o primeiro. " +
        "{limpar} Limpar a fila tira todos de uma vez. Colocar em votação também limpa a fila. Depois da votação, quem quiser falar levanta a mão de novo.",
      planos: [
        {
          em: "celular",
          layout: "celular",
          celular: "celular-mao",
          toque: "celular-mao#mao",
          destaque: "celular-mao#mao",
          rotulo: "Levantar a mão",
        },
        { em: "telao", layout: "telao", telao: "telao-maos", destaque: "telao-maos#fila", rotulo: "A fila no telão" },
        {
          em: "painel",
          layout: "painel",
          painel: "painel-maos",
          foco: "painel-maos#fila",
          zoom: 1.6,
          destaque: "painel-maos#fila",
          rotulo: "A fila no painel",
        },
        {
          em: "falou",
          cursor: "painel-maos#falou",
          clique: true,
          destaque: "painel-maos#falou",
          rotulo: "Já falou",
        },
        {
          em: "seguinte",
          painel: "painel-maos-falou",
          foco: "painel-maos-falou#fila",
          zoom: 1.6,
          destaque: "painel-maos-falou#fila",
          rotulo: "O seguinte",
        },
        {
          em: "limpar",
          cursor: "painel-maos-falou#limpar",
          destaque: "painel-maos-falou#limpar",
          rotulo: "Limpar a fila",
        },
      ],
    },
    {
      id: "S07-03-Fim",
      nome: "Fim",
      fala: "{fim} No próximo vídeo, os imprevistos da reunião.",
      cartao: { titulo: "Pedir a palavra", subtitulo: "Próximo vídeo: imprevistos" },
      planos: [],
    },
  ],
};
