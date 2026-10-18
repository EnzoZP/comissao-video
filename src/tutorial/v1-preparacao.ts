// Vídeo 1 de 4: a preparação, antes da reunião.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const V1: VideoTutorial = {
  id: "Tutorial1-Preparacao",
  numero: 1,
  titulo: "Preparação",
  cenas: [
    {
      id: "T1-01-Abertura",
      nome: "Abertura",
      fala:
        "Este vídeo mostra como preparar a reunião da comissão de nomeações no app de votação. " +
        "{material} Você vai precisar de um computador com internet, de um projetor para o telão e do celular de cada membro.",
      cartao: {
        titulo: "Preparação",
        subtitulo: "Tutorial da secretária · parte 1 de 4",
        itens: [
          { em: "material", icone: "computador", texto: "Computador com internet" },
          { em: "material", icone: "telao", texto: "Projetor para o telão" },
          { em: "material", icone: "celular", texto: "Celular de cada membro" },
        ],
      },
      planos: [],
    },
    {
      id: "T1-02-Conta",
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
      id: "T1-03-Entrar",
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
      id: "T1-04-Painel",
      nome: "Conhecendo o painel",
      fala:
        "{painel} Este é o painel da secretaria. " +
        "{aqui} O selo escrito Você está aqui fica no bloco do próximo passo. " +
        "{colunas} Na reunião, você usa o bloco chamado Agora, com a pauta em andamento. " +
        "{pautas} E o bloco chamado Pautas, com a lista. " +
        "{barra} A barra de cima mostra o que está acontecendo e leva a cada parte.",
      planos: [
        { em: "painel", layout: "painel", painel: "painel-inicio", rotulo: "Painel da secretaria" },
        {
          em: "aqui",
          painel: "painel-membros-vazio",
          foco: "painel-membros-vazio#aqui",
          zoom: 1.5,
          destaque: "painel-membros-vazio#aqui",
          rotulo: "Você está aqui",
        },
        { em: "colunas", painel: "painel-inicio", destaque: "painel-inicio#agora", rotulo: "Bloco Agora" },
        { em: "pautas", destaque: "painel-inicio#pautas", rotulo: "Bloco Pautas" },
        { em: "barra", foco: "painel-inicio#barra", destaque: "painel-inicio#barra", rotulo: "Barra de atalhos" },
      ],
    },
    {
      id: "T1-05-Membros",
      nome: "Cadastrar os membros",
      fala:
        "{membros} Comece cadastrando os membros da comissão. " +
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
      id: "T1-06-Telao",
      nome: "Abrir o telão",
      fala:
        "{pautas} As pautas ficam para o próximo vídeo. " +
        "{telao} Agora, o telão. Clique em Gerar link do telão. " +
        "{abrir} Depois clique em Abrir o telão. " +
        "{janela} O telão abre numa aba nova. Arraste a aba para fora e leve a janela para o projetor. Aperte a tecla éfe onze para ficar em tela cheia. " +
        "{mac} No Mac, clique no botão verde da janela.",
      planos: [
        {
          em: "pautas",
          layout: "painel",
          painel: "painel-telao-passo",
          foco: "painel-telao-passo#secao",
          zoom: 1.6,
          rotulo: "Agora, o telão",
        },
        {
          em: "telao",
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
      ],
    },
    {
      id: "T1-07-OutroComputador",
      nome: "Telão em outro computador",
      fala:
        "{outro} O telão fica em outro computador? Clique em Gerar código. " +
        "{endereco} No computador do telão, abra o endereço que aparece no painel. " +
        "{digitar} Depois digite os seis números e clique em Entrar. " +
        "{vale} O código vale dez minutos.",
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
      id: "T1-08-Entrada",
      nome: "Abrir a entrada pelo QR",
      fala:
        "{abrir} Com todos na sala, clique em Abrir entrada pelo quê erre e confirme. " +
        "{qr} O telão mostra o quê erre e um código de seis números.",
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
      ],
    },
    {
      id: "T1-09-Celular",
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
      id: "T1-10-Longe",
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
      id: "T1-11-NomeErrado",
      nome: "Nome errado",
      fala:
        "{errado} Alguém tocou no nome errado? " +
        "{liberar} Na lista de membros, clique em Liberar ao lado do nome que foi tocado por engano, e confirme. " +
        "{volta} O nome volta para a lista do quê erre. Quem errou escaneia de novo e toca no próprio nome.",
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
          em: "volta",
          layout: "celular",
          celular: "celular-entrar-lista-depois",
          destaque: "celular-entrar-lista-depois#carla",
          rotulo: "O nome volta à lista",
        },
      ],
    },
    {
      id: "T1-12-Tema",
      nome: "Tema claro ou escuro",
      fala:
        "{tema} No alto do painel, você escolhe o tema claro ou escuro. " +
        "{todas} Ele vale para todas as telas.",
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
      id: "T1-13-Fim",
      nome: "Fim",
      fala:
        "{fim} A preparação está pronta. No próximo vídeo, você conduz a reunião, da primeira pauta ao resultado.",
      cartao: {
        titulo: "Preparação pronta",
        subtitulo: "Próximo vídeo: a reunião",
      },
      planos: [],
    },
  ],
};
