// Secretária, vídeo 6: os membros indicam nomes pelo celular.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S06: VideoTutorial = {
  id: "S06-IndicacaoCelular",
  numero: 6,
  titulo: "Indicação pelo celular",
  cenas: [
    {
      id: "S06-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como deixar os membros indicarem nomes pelo celular, durante a discussão da pauta.",
      cartao: { titulo: "Indicação pelo celular", subtitulo: "Tutorial da secretária · vídeo 6" },
      planos: [],
    },
    {
      id: "S06-02-Liberar",
      nome: "Liberar a indicação",
      fala:
        "{liberar} Com a pauta em indicação, clique em Liberar indicação pelo celular. " +
        "{celular} No celular, cada membro escreve um nome e toca em Indicar. Cada pessoa indica um nome por pauta. " +
        "{tirar} Quem indicou pode tirar a própria indicação até a votação começar.",
      planos: [
        {
          em: "liberar",
          layout: "painel",
          painel: "painel-indicacao-liberar",
          foco: "painel-indicacao-liberar#agora",
          zoom: 1.4,
          cursor: "painel-indicacao-liberar#liberar",
          clique: true,
          destaque: "painel-indicacao-liberar#liberar",
          rotulo: "Liberar pelo celular",
        },
        {
          em: "celular",
          layout: "celular",
          celular: "celular-indicar-digitado",
          digitar: { alvo: "celular-indicar-digitado#campo", de: "celular-indicar" },
          toque: "celular-indicar-digitado#indicar",
          rotulo: "Um nome por pessoa",
        },
        {
          em: "tirar",
          celular: "celular-indicou",
          destaque: "celular-indicou#tirar",
          rotulo: "Tirar minha indicação",
        },
      ],
    },
    {
      id: "S06-03-Chegando",
      nome: "Os nomes chegando",
      fala:
        "{painel} O nome aparece na lista do painel, com quem indicou. " +
        "{telao} No telão também. " +
        "{xis} A secretaria tira qualquer nome pelo xis, como de costume. " +
        "{fechar} Para parar de receber nomes, clique em Fechar indicação pelo celular. Colocar em votação também fecha sozinho. " +
        "{ata} A ata e a planilha registram quem indicou cada nome.",
      planos: [
        {
          em: "painel",
          layout: "painel",
          painel: "painel-indicacao-3",
          foco: "painel-indicacao-3#lista",
          zoom: 1.6,
          destaque: "painel-indicacao-3#legenda",
          rotulo: "Quem indicou",
        },
        {
          em: "telao",
          layout: "telao",
          telao: "telao-indicacao-3",
          destaque: "telao-indicacao-3#legenda",
          rotulo: "Indicação de Ana",
        },
        {
          em: "xis",
          layout: "painel",
          foco: "painel-indicacao-3#lista",
          zoom: 1.8,
          cursor: "painel-indicacao-3#tirar",
          destaque: "painel-indicacao-3#tirar",
          rotulo: "O xis tira o nome",
        },
        {
          em: "fechar",
          foco: "painel-indicacao-3#fechar",
          zoom: 1.5,
          cursor: "painel-indicacao-3#fechar",
          clique: true,
          destaque: "painel-indicacao-3#fechar",
          rotulo: "Fechar a indicação",
        },
        { em: "ata", layout: "folha-larga", folha: "folha-ata", foco: "folha-ata#aberta", zoom: 1, destaque: "folha-ata#aberta", rotulo: "Na ata" },
      ],
    },
    {
      id: "S06-04-Fim",
      nome: "Fim",
      fala: "{fim} No próximo vídeo, os membros pedem a palavra pelo celular.",
      cartao: { titulo: "Indicação pelo celular", subtitulo: "Próximo vídeo: pedir a palavra" },
      planos: [],
    },
  ],
};
