// Secretária, vídeo 4: quórum, entrada pelo QR, código curto, nome errado e quem chega atrasado.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S04: VideoTutorial = {
  id: "S04-Entrada",
  numero: 4,
  titulo: "Entrada pelo QR",
  cenas: [
    {
      id: "S04-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como os membros entram pelo celular, com o quê erre do telão.",
      cartao: { titulo: "Entrada pelo QR", subtitulo: "Tutorial da secretária · vídeo 4" },
      planos: [],
    },
    {
      id: "S04-02-Quorum",
      nome: "Quórum",
      fala:
        "{quorum} A reunião tem quórum? Abra a gaveta Mais, escreva o número e clique em Salvar. " +
        "{opcional} O quórum é opcional. Ele aparece no telão e na ata, mas não impede ninguém de votar.",
      planos: [
        {
          em: "quorum",
          layout: "painel",
          painel: "painel-quorum",
          foco: "painel-quorum#form",
          zoom: 1.7,
          cursor: "painel-quorum#salvar",
          clique: true,
          destaque: "painel-quorum#campo",
          rotulo: "Quórum",
        },
        { em: "opcional", destaque: "painel-quorum#form", rotulo: "Opcional" },
      ],
    },
    {
      id: "S04-03-Abrir",
      nome: "Abrir a entrada pelo QR",
      fala:
        "{abrir} Com todos na sala, clique em Abrir entrada pelo quê erre e confirme. " +
        "{qr} O telão mostra o quê erre e um código de seis números. " +
        "{quorum} Com quórum, mostra também quantos faltam entrar para atingir o quórum.",
      planos: [
        {
          em: "abrir",
          layout: "painel",
          painel: "painel-entrada-fechada",
          foco: "painel-entrada-fechada#secao",
          zoom: 1.6,
          cursor: "painel-entrada-fechada#abrir",
          clique: true,
          destaque: "painel-entrada-fechada#abrir",
          dialogo: { captura: "painel-entrada-fechada" },
          rotulo: "Abrir entrada pelo QR",
        },
        { em: "qr", layout: "telao", telao: "telao-qr-0", destaque: "telao-qr-0#curto", rotulo: "QR e código" },
        { em: "quorum", destaque: "telao-qr-0#quorum", rotulo: "Faltam para o quórum" },
      ],
    },
    {
      id: "S04-04-Celular",
      nome: "O celular entrando",
      fala:
        "{camera} Cada membro aponta a câmera do celular para o quê erre e toca no link que aparece. " +
        "{nome} Depois toca no próprio nome e confirma. " +
        "{pronto} Pronto. O celular espera a votação abrir, e o telão mostra quem já entrou.",
      planos: [
        {
          em: "camera",
          layout: "celular+telao",
          telao: "telao-qr-0",
          celular: "celular-entrar-lista",
          camera: "telao-qr-0#qr",
          rotulo: "Câmera no QR",
        },
        {
          em: "nome",
          celular: "celular-entrar-lista",
          toque: "celular-entrar-lista#ana",
          dialogo: { captura: "celular-entrar-lista" },
          rotulo: "Toque no seu nome",
        },
        {
          em: "pronto",
          celular: "celular-aguardando",
          telao: "telao-qr-7",
          destaque: "telao-qr-7#grade",
          rotulo: "Pronto",
        },
      ],
    },
    {
      id: "S04-05-Longe",
      nome: "Longe do telão",
      fala:
        "{longe} Quem está longe do telão pode entrar sem o quê erre. " +
        "{codigo} No celular, a pessoa abre o endereço que aparece no telão, junto do quê erre, digita os seis números e toca em Entrar. " +
        "{nome} Depois toca no próprio nome e confirma. " +
        "{entrou} Pronto, a pessoa entrou.",
      planos: [
        {
          // o telão inteiro, com o anel no código: todo zoom testado cortava ao meio o QR, uma fileira
          // de nomes ou o título (o texto do telão é grande o bastante para ler sem zoom)
          em: "longe",
          layout: "telao",
          telao: "telao-qr-7",
          destaque: "telao-qr-7#curto",
          rotulo: "Longe do telão",
        },
        {
          em: "codigo",
          layout: "celular+telao",
          celular: "celular-codigo-digitado",
          digitar: { alvo: "celular-codigo-digitado#campo", de: "celular-codigo-vazio" },
          toque: "celular-codigo-digitado#entrar",
          rotulo: "Endereço e código",
        },
        {
          em: "nome",
          celular: "celular-curto-lista",
          toque: "celular-curto-lista#bruno",
          destaque: "celular-curto-lista#bruno",
          dialogo: { captura: "celular-curto-lista" },
          rotulo: "Toca no próprio nome",
        },
        {
          em: "entrou",
          celular: "celular-curto-aguardando",
          telao: "telao-qr-8",
          destaque: "telao-qr-8#selo",
          rotulo: "Entrou",
        },
      ],
    },
    {
      id: "S04-06-NomeErrado",
      nome: "Nome errado",
      fala:
        "{errado} Alguém tocou no nome errado? " +
        "{liberar} Na lista de membros, clique em Liberar ao lado do nome que foi tocado por engano, e confirme. " +
        "{semacesso} O celular de quem errou fica sem acesso. " +
        "{volta} O nome volta para a lista do quê erre, e cada um escaneia de novo e toca no próprio nome. " +
        "{votacao} Com a votação aberta, o botão Liberar aparece também na lista de quem falta votar.",
      planos: [
        {
          em: "errado",
          layout: "painel",
          painel: "painel-membros-liberar",
          foco: "painel-membros-liberar#linha",
          zoom: 1.15,
          destaque: "painel-membros-liberar#linha",
          rotulo: "Nome errado",
        },
        {
          em: "liberar",
          cursor: "painel-membros-liberar#liberar",
          clique: true,
          destaque: "painel-membros-liberar#liberar",
          dialogo: { captura: "painel-membros-liberar" },
          rotulo: "Liberar",
        },
        {
          em: "semacesso",
          layout: "celular",
          celular: "celular-sem-acesso",
          destaque: "celular-sem-acesso#aviso",
          rotulo: "Sem acesso",
        },
        {
          em: "volta",
          celular: "celular-entrar-lista-depois",
          destaque: "celular-entrar-lista-depois#carla",
          rotulo: "O nome volta à lista",
        },
        {
          em: "votacao",
          layout: "painel",
          painel: "painel-votacao-faltam",
          foco: "painel-votacao-faltam#faltam",
          zoom: 1.6,
          destaque: "painel-votacao-faltam#faltam",
          rotulo: "Liberar na votação",
        },
      ],
    },
    {
      id: "S04-07-Atrasado",
      nome: "Quem chega atrasado",
      fala:
        "{atrasado} Alguém chegou atrasado? Durante a reunião, o quê erre pequeno, no canto do telão, já serve. " +
        "{grande} Se precisar dele grande, clique em Mostrar o quê erre no telão, no bloco Agora. " +
        "{voltar} Depois clique em Voltar à votação no telão. " +
        "{volta} O telão volta a mostrar a votação.",
      planos: [
        {
          em: "atrasado",
          layout: "telao",
          telao: "telao-simnao-aberta",
          destaque: "telao-simnao-aberta#canto",
          rotulo: "QR no canto do telão",
        },
        {
          em: "grande",
          layout: "painel",
          painel: "painel-qr-atrasado",
          foco: "painel-qr-atrasado#mostrar",
          zoom: 1.5,
          cursor: "painel-qr-atrasado#mostrar",
          clique: true,
          destaque: "painel-qr-atrasado#mostrar",
          rotulo: "Mostrar o QR",
        },
        {
          em: "voltar",
          layout: "painel+telao",
          painel: "painel-qr-ligado",
          foco: "painel-qr-ligado#faixa",
          zoom: 1.6,
          telao: "telao-qr-atrasado",
          cursor: "painel-qr-ligado#voltar",
          clique: true,
          destaque: "painel-qr-ligado#voltar",
          rotulo: "Voltar à votação",
        },
        { em: "volta", layout: "telao", telao: "telao-simnao-aberta", rotulo: "A votação de volta" },
      ],
    },
    {
      id: "S04-08-Fim",
      nome: "Fim",
      fala: "{fim} Todos dentro. No próximo vídeo, você conduz uma pauta do começo ao resultado.",
      cartao: { titulo: "Todos dentro", subtitulo: "Próximo vídeo: conduzir uma pauta" },
      planos: [],
    },
  ],
};
