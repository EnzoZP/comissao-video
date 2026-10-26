// Membro: votar pelo celular. Curto, para mandar no grupo da comissão antes da reunião.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const M1: VideoTutorial = {
  id: "M1-Celular",
  numero: 13,
  titulo: "Votando pelo celular",
  cenas: [
    {
      id: "M1-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como participar da reunião da comissão de nomeações pelo celular. Você não precisa instalar nada.",
      cartao: { titulo: "Votando pelo celular", subtitulo: "Para os membros da comissão" },
      planos: [],
    },
    {
      id: "M1-02-Entrar",
      nome: "Entrar",
      fala:
        "{camera} No começo da reunião, aponte a câmera do celular para o quê erre do telão e toque no link que aparece. " +
        "{nome} Toque no seu nome e confirme. " +
        "{pronto} Pronto. Agora é só esperar a votação abrir.",
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
        { em: "pronto", layout: "celular", celular: "celular-aguardando", destaque: "celular-aguardando#status", rotulo: "Pronto" },
      ],
    },
    {
      id: "M1-03-Longe",
      nome: "Longe do telão",
      fala:
        "{longe} Está longe do telão? Abra no celular o endereço que aparece embaixo do quê erre, digite os seis números e toque em Entrar. " +
        "{nome} Depois toque no seu nome e confirme. " +
        "{errado} Tocou no nome errado? Avise a secretaria. O celular fica sem acesso até ela liberar o nome, e aí você escaneia de novo.",
      planos: [
        {
          em: "longe",
          layout: "celular+telao",
          telao: "telao-qr-7",
          celular: "celular-codigo-digitado",
          digitar: { alvo: "celular-codigo-digitado#campo", de: "celular-codigo-vazio" },
          toque: "celular-codigo-digitado#entrar",
          rotulo: "Endereço e código",
        },
        {
          em: "nome",
          layout: "celular",
          celular: "celular-curto-lista",
          toque: "celular-curto-lista#bruno",
          dialogo: { captura: "celular-curto-lista" },
          rotulo: "Toque no seu nome",
        },
        { em: "errado", celular: "celular-sem-acesso", destaque: "celular-sem-acesso#aviso", rotulo: "Nome errado? Avise" },
      ],
    },
    {
      id: "M1-04-Indicar",
      nome: "Indicar um nome",
      fala:
        "{indicar} Durante a discussão, se a secretaria liberar, você pode indicar um nome. Escreva e toque em Indicar. " +
        "{telao} O nome aparece no telão, com o seu nome embaixo. " +
        "{tirar} Mudou de ideia? Toque em Tirar minha indicação, antes de a votação começar.",
      planos: [
        {
          em: "indicar",
          layout: "celular",
          celular: "celular-indicar-digitado",
          digitar: { alvo: "celular-indicar-digitado#campo", de: "celular-indicar" },
          toque: "celular-indicar-digitado#indicar",
          rotulo: "Indicar um nome",
        },
        {
          em: "telao",
          layout: "celular+telao",
          celular: "celular-indicou",
          telao: "telao-indicacao-3",
          destaque: "telao-indicacao-3#legenda",
          rotulo: "Seu nome no telão",
        },
        { em: "tirar", layout: "celular", destaque: "celular-indicou#tirar", rotulo: "Tirar minha indicação" },
      ],
    },
    {
      id: "M1-05-Mao",
      nome: "Pedir a palavra",
      fala:
        "{mao} Quer falar? Toque em Levantar a mão para falar. " +
        "{fila} Seu nome entra na fila do telão, e o celular mostra a sua posição. " +
        "{baixar} Desistiu? Toque em Baixar a mão. Durante a votação, o botão some.",
      planos: [
        { em: "mao", layout: "celular", celular: "celular-mao", toque: "celular-mao#mao", rotulo: "Levantar a mão" },
        {
          em: "fila",
          layout: "celular+telao",
          celular: "celular-mao-levantada",
          telao: "telao-maos",
          destaque: "telao-maos#fila",
          rotulo: "Sua vez na fila",
        },
        { em: "baixar", layout: "celular", destaque: "celular-mao-levantada#mao", rotulo: "Baixar a mão" },
      ],
    },
    {
      id: "M1-06-Votar",
      nome: "Votar",
      fala:
        "{votar} Quando a votação abrir, toque no nome em que você vota. " +
        "{trocar} Você pode trocar o voto até a secretaria encerrar a votação. " +
        "{simnao} Com um nome só, toque em Sim ou em Não. " +
        "{abster} Se não quiser votar, toque em Me abstenho.",
      planos: [
        {
          em: "votar",
          layout: "celular",
          celular: "celular-votacao-nomes",
          toque: "celular-votacao-nomes#sergio",
          rotulo: "Toque no nome",
        },
        { em: "trocar", celular: "celular-votou", destaque: "celular-votou#status", rotulo: "Dá para trocar" },
        { em: "simnao", celular: "celular-simnao", destaque: "celular-simnao#sim", rotulo: "Sim ou Não" },
        { em: "abster", toque: "celular-simnao#abster", destaque: "celular-simnao#abster", rotulo: "Me abstenho" },
      ],
    },
    {
      id: "M1-07-Outros",
      nome: "Outros jeitos de votar",
      fala:
        "{ordem} Às vezes a votação pede a ordem dos nomes. Use as setas para subir ou descer cada nome, e toque em Enviar minha ordem. " +
        "{varios} Outras vezes, você pode marcar mais de um nome. Marque e toque em Confirmar. " +
        "{secreto} No voto secreto, o telão mostra só que você votou, sem o seu voto.",
      planos: [
        { em: "ordem", layout: "celular", celular: "celular-ordem-mexida", toque: "celular-ordem-mexida#enviar", rotulo: "Ordem dos nomes" },
        { em: "varios", celular: "celular-multipla", toque: "celular-multipla#confirmar", rotulo: "Vários nomes" },
        {
          em: "secreto",
          layout: "celular+telao",
          celular: "celular-secreto",
          telao: "telao-secreta-aberta",
          destaque: "telao-secreta-aberta#grade",
          rotulo: "Voto secreto",
        },
      ],
    },
    {
      id: "M1-08-Fim",
      nome: "Fim",
      fala: "{fim} Pronto. Deixe o celular carregado e a internet ligada. Bom trabalho na comissão.",
      cartao: { titulo: "Pronto", subtitulo: "Bom trabalho na comissão" },
      planos: [],
    },
  ],
};
