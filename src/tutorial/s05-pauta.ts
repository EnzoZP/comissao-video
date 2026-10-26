// Secretária, vídeo 5: uma pauta do começo ao resultado registrado.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S05: VideoTutorial = {
  id: "S05-Pauta",
  numero: 5,
  titulo: "Conduzir uma pauta",
  cenas: [
    {
      id: "S05-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra como conduzir uma pauta pelo painel, da lista de cargos até o resultado registrado.",
      cartao: { titulo: "Conduzir uma pauta", subtitulo: "Tutorial da secretária · vídeo 5" },
      planos: [],
    },
    {
      id: "S05-02-Pautas",
      nome: "Listar as pautas",
      fala:
        "{pautas} Antes da reunião, liste as pautas no bloco Pautas, um cargo por linha. " +
        "{adicionar} Depois clique em Adicionar pautas. " +
        "{lista} Os nomes dos indicados você digita na hora, quando a pauta começar. As pautas ficam guardadas de uma noite para outra.",
      planos: [
        {
          em: "pautas",
          layout: "painel",
          painel: "painel-pautas-digitadas",
          digitar: { alvo: "painel-pautas-digitadas#campo", de: "painel-pautas-vazio" },
          foco: "painel-pautas-digitadas#coluna",
          zoom: 1.6,
          rotulo: "Um cargo por linha",
        },
        {
          em: "adicionar",
          cursor: "painel-pautas-digitadas#adicionar",
          clique: true,
          destaque: "painel-pautas-digitadas#adicionar",
          rotulo: "Adicionar pautas",
        },
        {
          em: "lista",
          painel: "painel-pautas-lista",
          foco: "painel-pautas-lista#lista",
          zoom: 1.4,
          rotulo: "Nomes na hora",
        },
      ],
    },
    {
      id: "S05-03-Comecar",
      nome: "Começar a pauta",
      fala:
        "{comecar} Na reunião, clique em Começar, na linha da pauta, no bloco Pautas. " +
        "{telao} A pauta vai para o bloco Agora. O telão mostra o cargo, e a comissão faz as indicações.",
      planos: [
        {
          em: "comecar",
          layout: "painel",
          painel: "painel-pautas-lista",
          foco: "painel-pautas-lista#lista",
          zoom: 1.6,
          cursor: "painel-pautas-lista#comecar",
          clique: true,
          destaque: "painel-pautas-lista#comecar",
          rotulo: "Começar a pauta",
        },
        {
          em: "telao",
          layout: "painel+telao",
          painel: "painel-indicacao-vazia",
          foco: "painel-indicacao-vazia#agora",
          zoom: 1.25,
          telao: "telao-indicacao-vazia",
          destaque: "telao-indicacao-vazia#topo",
          rotulo: "O cargo no telão",
        },
      ],
    },
    {
      id: "S05-04-Indicados",
      nome: "Digitar os indicados",
      fala:
        "{digitar} Digite cada nome indicado e aperte a tecla Enter. " +
        "{telao} Os nomes aparecem no telão durante a discussão. Os que vieram do celular mostram quem indicou. " +
        "{tirar} Para tirar um nome da lista, clique no xis ao lado dele.",
      planos: [
        {
          em: "digitar",
          layout: "painel",
          painel: "painel-indicacao-digitando",
          digitar: { alvo: "painel-indicacao-digitando#campo", de: "painel-indicacao-vazia" },
          foco: "painel-indicacao-digitando#campo",
          zoom: 1.6,
          rotulo: "Nome e Enter",
        },
        {
          em: "telao",
          layout: "painel+telao",
          painel: "painel-indicacao-3",
          foco: "painel-indicacao-3#lista",
          zoom: 1.5,
          telao: "telao-indicacao-3",
          destaque: "telao-indicacao-3#indicados",
          rotulo: "Indicados no telão",
        },
        {
          em: "tirar",
          layout: "painel",
          foco: "painel-indicacao-3#lista",
          zoom: 1.8,
          cursor: "painel-indicacao-3#tirar",
          destaque: "painel-indicacao-3#tirar",
          rotulo: "O xis tira o nome",
        },
      ],
    },
    {
      id: "S05-05-ComoVotar",
      nome: "Como votar",
      fala:
        "{modo} Terminou a discussão? Escolha como votar. Com um nome, a votação é Sim ou Não. Com dois ou mais, cada membro escolhe um nome. " +
        "{secreto} O voto secreto já vem marcado. Neste exemplo, o voto é aberto, então desmarque a caixa do voto secreto. " +
        "{colocar} Depois clique em Colocar em votação.",
      planos: [
        {
          em: "modo",
          layout: "painel",
          painel: "painel-como-votar",
          foco: "painel-como-votar#form",
          zoom: 1.6,
          destaque: "painel-como-votar#modo",
          rotulo: "Como votar",
        },
        {
          em: "secreto",
          cursor: "painel-como-votar#secreto",
          clique: true,
          destaque: "painel-como-votar#secreto",
          rotulo: "Voto secreto",
        },
        {
          em: "colocar",
          painel: "painel-como-votar-aberto",
          foco: "painel-como-votar-aberto#form",
          zoom: 1.6,
          cursor: "painel-como-votar-aberto#colocar",
          clique: true,
          destaque: "painel-como-votar-aberto#colocar",
          rotulo: "Colocar em votação",
        },
      ],
    },
    {
      id: "S05-06-Votacao",
      nome: "Votação aberta",
      fala:
        "{celular} Cada membro vota no celular. {trocar} Ele pode trocar o voto até o fim da votação. " +
        "{telao} No voto aberto, o telão mostra o voto de cada um.",
      planos: [
        {
          em: "celular",
          layout: "celular",
          celular: "celular-votacao-nomes",
          toque: "celular-votacao-nomes#sergio",
          rotulo: "Voto no celular",
        },
        {
          em: "trocar",
          celular: "celular-votou",
          destaque: "celular-votou#status",
          rotulo: "Dá para trocar",
        },
        {
          em: "telao",
          layout: "celular+telao",
          celular: "celular-votou",
          telao: "telao-votacao-aberta",
          destaque: "telao-votacao-aberta#grade",
          rotulo: "O voto de cada um",
        },
      ],
    },
    {
      id: "S05-07-Faltam",
      nome: "Quem falta votar",
      fala:
        "{faltam} O painel mostra quem ainda não votou. " +
        "{registrar} Alguém está sem celular? Clique no voto que a pessoa disser, na linha dela. " +
        "{secretaria} O telão mostra que o voto foi registrado pela secretaria.",
      planos: [
        {
          em: "faltam",
          layout: "painel",
          painel: "painel-votacao-faltam",
          foco: "painel-votacao-faltam#faltam",
          zoom: 1.6,
          destaque: "painel-votacao-faltam#faltam",
          rotulo: "Quem falta votar",
        },
        {
          em: "registrar",
          painel: "painel-registrar-joao",
          foco: "painel-registrar-joao#linha",
          zoom: 1.6,
          cursor: "painel-registrar-joao#sergio",
          clique: true,
          destaque: "painel-registrar-joao#linha",
          rotulo: "Sem celular? Registre",
        },
        {
          em: "secretaria",
          layout: "telao",
          telao: "telao-registrado",
          foco: "telao-registrado#joao",
          zoom: 1.15,
          destaque: "telao-registrado#joao",
          rotulo: "Registrado pela secretaria",
        },
      ],
    },
    {
      id: "S05-08-Encerrar",
      nome: "Encerrar a votação",
      fala:
        "{todos} Quando aparecer o aviso que diz Todos votaram, clique em Encerrar votação. " +
        "{resultado} O resultado aparece no telão.",
      planos: [
        {
          em: "todos",
          layout: "painel",
          painel: "painel-votacao-todos",
          foco: "painel-votacao-todos#todos",
          zoom: 1.6,
          cursor: "painel-votacao-todos#encerrar",
          clique: true,
          destaque: "painel-votacao-todos#todos",
          rotulo: "Todos votaram",
        },
        {
          em: "resultado",
          layout: "telao",
          telao: "telao-resultado-musica",
          destaque: "telao-resultado-musica#resultado",
          rotulo: "Resultado no telão",
        },
      ],
    },
    {
      id: "S05-09-Registrar",
      nome: "Registrar o resultado",
      fala:
        "{registro} Agora registre o resultado. O painel já deixa marcado quem venceu e o cargo dele em Cargos e líderes. " +
        "{confirmar} Confira e clique em Confirmar eleito. " +
        "{lideres} O nome vai para Cargos e líderes, aguardando a resposta da pessoa. " +
        "{desfazer} Se errar, clique em Desfazer registro e confirme.",
      planos: [
        {
          em: "registro",
          layout: "painel",
          painel: "painel-registre",
          foco: "painel-registre#caixa",
          zoom: 1.6,
          rotulo: "Registre o resultado",
        },
        {
          em: "confirmar",
          cursor: "painel-registre#confirmar",
          clique: true,
          destaque: "painel-registre#confirmar",
          rotulo: "Confirmar eleito",
        },
        {
          em: "lideres",
          painel: "painel-registrado",
          foco: "painel-registrado#registrado",
          zoom: 1.6,
          destaque: "painel-registrado#registrado",
          rotulo: "Aguardando resposta",
        },
        {
          em: "desfazer",
          cursor: "painel-registrado#desfazer",
          destaque: "painel-registrado#desfazer",
          rotulo: "Desfazer registro",
        },
      ],
    },
    {
      id: "S05-10-SimNao",
      nome: "Sim ou Não",
      fala:
        "{proxima} Depois, clique em Começar na próxima pauta da lista e coloque em votação, como antes. " +
        "{simnao} Com um nome só, cada membro vota Sim ou Não. " +
        "{aprovado} O nome é aprovado quando recebe mais Sim do que Não.",
      planos: [
        {
          em: "proxima",
          layout: "painel",
          painel: "painel-proxima-lista",
          foco: "painel-proxima-lista#lista",
          zoom: 1.5,
          cursor: "painel-proxima-lista#comecar",
          clique: true,
          destaque: "painel-proxima-lista#comecar",
          rotulo: "Próxima pauta",
        },
        {
          em: "simnao",
          layout: "celular+telao",
          celular: "celular-simnao",
          telao: "telao-simnao-aberta",
          rotulo: "Sim ou Não",
        },
        {
          em: "aprovado",
          layout: "telao",
          telao: "telao-aprovado",
          destaque: "telao-aprovado#resultado",
          rotulo: "Mais Sim que Não",
        },
      ],
    },
    {
      id: "S05-11-Fim",
      nome: "Fim",
      fala: "{fim} Pauta conduzida. No próximo vídeo, os membros indicam nomes pelo celular.",
      cartao: { titulo: "Pauta conduzida", subtitulo: "Próximo vídeo: indicação pelo celular" },
      planos: [],
    },
  ],
};
