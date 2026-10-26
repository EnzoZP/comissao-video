// Secretária, vídeo 12: o feedback dos membros da igreja, pelo QR fixo.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S12: VideoTutorial = {
  id: "S12-Feedback",
  numero: 12,
  titulo: "Feedback",
  cenas: [
    {
      id: "S12-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra o feedback que a igreja manda pelo quê erre fixo, para cada cargo.",
      cartao: { titulo: "Feedback", subtitulo: "Tutorial da secretária · vídeo 12" },
      planos: [],
    },
    {
      id: "S12-02-Feedback",
      nome: "Feedback pelo QR",
      fala:
        "{feedback} No alto do painel, clique em Feedback. " +
        "{qr} Ali fica o quê erre fixo da igreja. Clique em Baixar imagem do quê erre e ponha na apresentação do culto. " +
        "{form} Quem escaneia escolhe o cargo e escreve. " +
        "{lido} Você lê tudo nessa tela, sem ver quem enviou. Repasse ao líder e clique em Marcar como lido. " +
        "{lidos} O recado passa para a aba Lidos.",
      planos: [
        {
          em: "feedback",
          layout: "painel",
          painel: "painel-encerrado",
          foco: "painel-encerrado#barra",
          zoom: 1.4,
          cursor: "painel-encerrado#feedback",
          clique: true,
          destaque: "painel-encerrado#feedback",
          rotulo: "Feedback",
        },
        {
          em: "qr",
          painel: "feedback-qr",
          foco: "feedback-qr#qr",
          zoom: 1.5,
          cursor: "feedback-qr#baixar",
          clique: true,
          destaque: "feedback-qr#baixar",
          rotulo: "QR fixo de feedback",
        },
        {
          em: "form",
          layout: "celular",
          celular: "celular-feedback",
          destaque: "celular-feedback#cargo",
          rotulo: "Cargo e recado",
        },
        {
          em: "lido",
          layout: "painel",
          painel: "feedback-lista",
          foco: "feedback-lista#lista",
          zoom: 1.4,
          cursor: "feedback-lista#lido",
          clique: true,
          destaque: "feedback-lista#lido",
          rotulo: "Marcar como lido",
        },
        {
          em: "lidos",
          painel: "feedback-lido",
          foco: "feedback-lido#abas",
          zoom: 1.4,
          destaque: "feedback-lido#lidos",
          rotulo: "Vai para Lidos",
        },
      ],
    },
    {
      id: "S12-03-Fim",
      nome: "Fim",
      fala: "{fim} Pronto. Agora você já sabe usar o app do começo ao fim. Bom trabalho na comissão.",
      cartao: { titulo: "Pronto", subtitulo: "Bom trabalho na comissão" },
      planos: [],
    },
  ],
};
