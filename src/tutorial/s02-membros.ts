// Secretária, vídeo 2: os membros da comissão, um a um e em lote.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S02: VideoTutorial = {
  id: "S02-Membros",
  numero: 2,
  titulo: "Membros da comissão",
  cenas: [
    {
      id: "S02-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como cadastrar os membros da comissão e cuidar da lista.",
      cartao: { titulo: "Membros da comissão", subtitulo: "Tutorial da secretária · vídeo 2" },
      planos: [],
    },
    {
      id: "S02-02-Cadastrar",
      nome: "Cadastrar os membros",
      fala:
        "{membros} Na gaveta da Preparação, comece cadastrando os membros da comissão. " +
        "{nomes} Escreva um nome por linha. " +
        "{adicionar} Depois clique em Adicionar membros. " +
        "{lista} Isso se faz uma vez só. Nas próximas reuniões, só confira se a lista está certa.",
      planos: [
        {
          em: "membros",
          layout: "painel",
          painel: "painel-membros-vazio",
          foco: "painel-membros-vazio#campo",
          zoom: 1.6,
          rotulo: "Membros da comissão",
        },
        {
          em: "nomes",
          painel: "painel-membros-digitados",
          digitar: { alvo: "painel-membros-digitados#campo", de: "painel-membros-vazio" },
          foco: "painel-membros-digitados#campo",
          zoom: 1.6,
          rotulo: "Um nome por linha",
        },
        {
          em: "adicionar",
          cursor: "painel-membros-digitados#adicionar",
          clique: true,
          destaque: "painel-membros-digitados#adicionar",
          rotulo: "Adicionar membros",
        },
        { em: "lista", painel: "painel-membros-lista", foco: "painel-membros-lista#lista", zoom: 1.4, rotulo: "Uma vez só" },
      ],
    },
    {
      id: "S02-03-Links",
      nome: "O link de cada membro",
      fala:
        "{abrir} Depois, a lista fica recolhida. Para ver, clique em Membros, na barra de cima. " +
        "{copiar} Cada membro tem um link pessoal. Quem preferir pode receber o link pelo WhatsApp. Clique em Copiar link e mande para a pessoa. " +
        "{novo} Se um link for parar com outra pessoa, clique em Novo link. O antigo para de funcionar.",
      planos: [
        {
          em: "abrir",
          layout: "painel",
          painel: "painel-inicio",
          foco: "painel-inicio#barra",
          zoom: 1.4,
          cursor: "painel-inicio#membros",
          clique: true,
          destaque: "painel-inicio#membros",
          rotulo: "Membros",
        },
        {
          em: "copiar",
          painel: "painel-membros-lista",
          foco: "painel-membros-lista#ana",
          zoom: 1.5,
          cursor: "painel-membros-lista#copiar",
          destaque: "painel-membros-lista#copiar",
          rotulo: "Copiar link",
        },
        {
          em: "novo",
          cursor: "painel-membros-lista#novo",
          destaque: "painel-membros-lista#novo",
          rotulo: "Novo link",
        },
      ],
    },
    {
      id: "S02-04-Lote",
      nome: "Membros em lote",
      fala:
        "{lote} Na comissão seguinte, a lista pode mudar de uma vez. " +
        "{aceitou} Adicionar quem aceitou cargo põe na comissão todos que aceitaram em Cargos e líderes, sem repetir quem já está. " +
        "{remover} Remover todos tira todos os membros, e os links param de funcionar. Os votos antigos continuam na ata. " +
        "{votacao} Com a votação aberta, a lista não pode ser esvaziada.",
      planos: [
        {
          em: "lote",
          layout: "painel",
          painel: "painel-membros-lote",
          foco: "painel-membros-lote#botoes",
          zoom: 1.5,
          destaque: "painel-membros-lote#botoes",
          rotulo: "Membros em lote",
        },
        {
          em: "aceitou",
          cursor: "painel-membros-lote#lideres",
          clique: true,
          destaque: "painel-membros-lote#lideres",
          rotulo: "Quem aceitou cargo",
        },
        {
          em: "remover",
          painel: "painel-membros-lote-feito",
          foco: "painel-membros-lote-feito#botoes",
          zoom: 1.5,
          cursor: "painel-membros-lote-feito#remover",
          clique: true,
          destaque: "painel-membros-lote-feito#remover",
          dialogo: { captura: "painel-membros-lote-feito" },
          rotulo: "Remover todos",
        },
        { em: "votacao", painel: "painel-membros-lote-feito", rotulo: "Não durante a votação" },
      ],
    },
    {
      id: "S02-05-Fim",
      nome: "Fim",
      fala: "{fim} Membros cadastrados. No próximo vídeo, o telão.",
      cartao: { titulo: "Membros cadastrados", subtitulo: "Próximo vídeo: o telão" },
      planos: [],
    },
  ],
};
