// Secretária, vídeo 3: o telão, neste computador ou em outro.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S03: VideoTutorial = {
  id: "S03-Telao",
  numero: 3,
  titulo: "O telão",
  cenas: [
    {
      id: "S03-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como abrir o telão no projetor, neste computador ou em outro.",
      cartao: { titulo: "O telão", subtitulo: "Tutorial da secretária · vídeo 3" },
      planos: [],
    },
    {
      id: "S03-02-Abrir",
      nome: "Abrir o telão",
      fala:
        "{telao} Na barra de cima, clique em Telão e quê erre. {gerar} Depois clique em Gerar link do telão. " +
        "{abrir} Agora clique em Abrir o telão. " +
        "{janela} O telão abre numa aba nova. Arraste a aba para fora e leve a janela para o projetor. Aperte a tecla éfe onze para ficar em tela cheia. " +
        "{mac} No Mac, clique no botão verde da janela. " +
        "{nova} Gere um link novo a cada reunião. O da reunião anterior para de funcionar.",
      planos: [
        {
          em: "telao",
          layout: "painel",
          painel: "painel-telao-passo",
          foco: "painel-telao-passo#secao",
          zoom: 1.6,
          rotulo: "Telão e QR",
        },
        {
          // o clique cai depois do "clique" desta frase, não do da frase anterior
          em: "gerar",
          cursor: "painel-telao-passo#gerar",
          clique: true,
          destaque: "painel-telao-passo#gerar",
          rotulo: "Gerar link do telão",
        },
        {
          em: "abrir",
          painel: "painel-telao-link",
          foco: "painel-telao-link#secao",
          zoom: 1.6,
          cursor: "painel-telao-link#abrir",
          clique: true,
          destaque: "painel-telao-link#abrir",
          rotulo: "Abrir o telão",
        },
        { em: "janela", layout: "telao", telao: "telao-aguardando", rotulo: "No projetor, tecla F11" },
        { em: "mac", janelaMac: true, rotulo: "No Mac, botão verde" },
        { em: "nova", layout: "painel", painel: "painel-telao-link", foco: "painel-telao-link#secao", zoom: 1.6, rotulo: "Link novo a cada reunião" },
      ],
    },
    {
      id: "S03-03-OutroComputador",
      nome: "Telão em outro computador",
      fala:
        "{outro} O telão fica em outro computador? Clique em Gerar código. " +
        "{endereco} No computador do telão, abra o endereço que aparece no painel. " +
        "{digitar} Depois digite os seis números e clique em Entrar. " +
        "{vale} O código vale dez minutos e serve uma vez só.",
      planos: [
        {
          em: "outro",
          layout: "painel",
          painel: "painel-telao-link",
          foco: "painel-telao-link#secao",
          zoom: 1.6,
          cursor: "painel-telao-link#codigo",
          clique: true,
          destaque: "painel-telao-link#codigo",
          rotulo: "Gerar código",
        },
        {
          em: "endereco",
          painel: "painel-telao-codigo",
          foco: "painel-telao-codigo#bloco",
          zoom: 1.6,
          destaque: "painel-telao-codigo#bloco",
          rotulo: "Endereço e código",
        },
        {
          em: "digitar",
          layout: "painel+telao",
          foco: "painel-telao-codigo#bloco",
          telao: "telao-codigo-digitado",
          digitar: { alvo: "telao-codigo-digitado#campo", de: "telao-codigo-vazio" },
          cursor: "telao-codigo-digitado#entrar",
          clique: true,
          destaque: "telao-codigo-digitado#entrar",
          rotulo: "O código no telão",
        },
        { em: "vale", telao: "telao-aguardando", rotulo: "Telão conectado" },
      ],
    },
    {
      id: "S03-04-Fim",
      nome: "Fim",
      fala: "{fim} Telão pronto. No próximo vídeo, os membros entram pelo quê erre.",
      cartao: { titulo: "Telão pronto", subtitulo: "Próximo vídeo: a entrada pelo QR" },
      planos: [],
    },
  ],
};
