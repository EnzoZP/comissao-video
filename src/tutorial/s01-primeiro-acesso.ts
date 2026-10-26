// Secretária, vídeo 1: criar a conta, entrar e conhecer o painel.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S01: VideoTutorial = {
  id: "S01-PrimeiroAcesso",
  numero: 1,
  titulo: "Primeiro acesso",
  cenas: [
    {
      id: "S01-01-Abertura",
      nome: "Abertura",
      fala:
        "Este vídeo mostra o primeiro acesso ao painel da secretaria, no app de votação da comissão de nomeações. " +
        "{material} Para a reunião, você vai precisar de um computador com internet, de um projetor para o telão e do celular de cada membro.",
      cartao: {
        titulo: "Primeiro acesso",
        subtitulo: "Tutorial da secretária · vídeo 1",
        itens: [
          { em: "material", icone: "computador", texto: "Computador com internet" },
          { em: "material", icone: "telao", texto: "Projetor para o telão" },
          { em: "material", icone: "celular", texto: "Celular de cada membro" },
        ],
      },
      planos: [],
    },
    {
      id: "S01-02-Conta",
      nome: "Criar a conta",
      fala:
        "{convite} Primeiro, o responsável pelo app manda para você um link de convite. " +
        "{campos} Abra o link e escreva seu nome, seu e-mail e uma senha de pelo menos doze caracteres. Repita a senha no campo de baixo. " +
        "{criar} Depois clique em Criar minha conta. " +
        "{pronto} Pronto. Você já está no painel.",
      planos: [
        { em: "convite", layout: "painel", painel: "convite-vazio", foco: "convite-vazio#form", zoom: 1.4, rotulo: "Link de convite" },
        {
          em: "campos",
          painel: "convite-preenchido",
          digitar: { alvo: "convite-preenchido#form", de: "convite-vazio" },
          foco: "convite-preenchido#form",
          zoom: 1.4,
          rotulo: "Nome, e-mail e senha",
        },
        {
          em: "criar",
          cursor: "convite-preenchido#criar",
          clique: true,
          destaque: "convite-preenchido#criar",
          rotulo: "Criar minha conta",
        },
        { em: "pronto", painel: "painel-inicio", rotulo: "Conta criada" },
      ],
    },
    {
      id: "S01-03-Entrar",
      nome: "Entrar no painel",
      fala:
        "{login} Nas outras vezes, entre pelo endereço do painel, com seu e-mail e sua senha. Guarde esse endereço nos favoritos. " +
        "{lembrar} No seu computador, marque Lembrar neste computador. " +
        "{sair} Em computador emprestado, não marque, e clique em Sair quando terminar.",
      planos: [
        {
          em: "login",
          layout: "painel",
          painel: "login-digitado",
          digitar: { alvo: "login-digitado#form", de: "login-vazio" },
          foco: "login-digitado#form",
          zoom: 1.13,
          rotulo: "E-mail e senha",
        },
        {
          em: "lembrar",
          painel: "login-preenchido",
          foco: "login-preenchido#form",
          zoom: 1.13,
          destaque: "login-preenchido#lembrar",
          rotulo: "Só no seu computador",
        },
        {
          em: "sair",
          painel: "painel-inicio",
          foco: "painel-inicio#sair",
          zoom: 1.8,
          cursor: "painel-inicio#sair",
          destaque: "painel-inicio#sair",
          rotulo: "Sair no fim",
        },
      ],
    },
    {
      id: "S01-04-Painel",
      nome: "Conhecendo o painel",
      fala:
        "{painel} Este é o painel da secretaria. " +
        "{colunas} Na reunião, você usa o bloco Agora, com a pauta em andamento. " +
        "{pautas} E o bloco Pautas, com a lista. " +
        "{gavetas} Mais abaixo ficam as gavetas da Preparação, de Depois da reunião e de Mais. A gaveta da vez abre sozinha. " +
        "{aqui} O selo escrito Você está aqui mostra o próximo passo. " +
        "{barra} A barra de cima mostra o que está acontecendo e leva a cada parte. " +
        "{duvida} E o botão de interrogação, ao lado do título de cada bloco, explica o que fazer ali.",
      planos: [
        { em: "painel", layout: "painel", painel: "painel-inicio", rotulo: "Painel da secretaria" },
        { em: "colunas", destaque: "painel-inicio#agora", rotulo: "Bloco Agora" },
        { em: "pautas", destaque: "painel-inicio#pautas", rotulo: "Bloco Pautas" },
        { em: "gavetas", painel: "painel-gavetas", destaque: "painel-gavetas#gavetas", rotulo: "As gavetas" },
        {
          em: "aqui",
          painel: "painel-membros-vazio",
          foco: "painel-membros-vazio#aqui",
          zoom: 1.5,
          destaque: "painel-membros-vazio#aqui",
          rotulo: "Você está aqui",
        },
        { em: "barra", painel: "painel-inicio", foco: "painel-inicio#barra", destaque: "painel-inicio#barra", rotulo: "Barra de atalhos" },
        {
          em: "duvida",
          painel: "painel-ajuda-bloco",
          foco: "painel-ajuda-bloco#texto",
          zoom: 1.4,
          destaque: "painel-ajuda-bloco#botao",
          rotulo: "Botão de interrogação",
        },
      ],
    },
    {
      id: "S01-05-Tema",
      nome: "Tema claro ou escuro",
      fala:
        "{tema} No alto do painel, o botão do sol troca para o tema escuro, e o da lua volta ao claro. " +
        "{todas} O tema vale para todas as telas, inclusive o telão e os celulares.",
      planos: [
        {
          em: "tema",
          layout: "painel",
          painel: "painel-tema-escuro",
          foco: "painel-tema-escuro#tema",
          zoom: 1.9,
          destaque: "painel-tema-escuro#tema",
          rotulo: "Claro ou escuro",
        },
        {
          em: "todas",
          layout: "painel+telao",
          painel: "painel-tema-escuro",
          telao: "telao-qr-escuro",
          rotulo: "Vale para todas as telas",
        },
      ],
    },
    {
      id: "S01-06-Ajuda",
      nome: "Ajuda",
      fala:
        "{ajuda} Ficou com dúvida? Clique em Ajuda, no alto do painel. " +
        "{contato} O painel desce até o contato do Enzo, pelo WhatsApp.",
      planos: [
        {
          em: "ajuda",
          layout: "painel",
          painel: "painel-inicio",
          foco: "painel-inicio#ajuda",
          zoom: 1.8,
          cursor: "painel-inicio#ajuda",
          clique: true,
          destaque: "painel-inicio#ajuda",
          rotulo: "Ajuda",
        },
        {
          em: "contato",
          painel: "painel-ajuda",
          foco: "painel-ajuda#contato",
          zoom: 1.6,
          destaque: "painel-ajuda#contato",
          rotulo: "WhatsApp do Enzo",
        },
      ],
    },
    {
      id: "S01-07-Fim",
      nome: "Fim",
      fala: "{fim} Pronto, você já conhece o painel. No próximo vídeo, os membros da comissão.",
      cartao: { titulo: "Painel pronto", subtitulo: "Próximo vídeo: os membros" },
      planos: [],
    },
  ],
};
