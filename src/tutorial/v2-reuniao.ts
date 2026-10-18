// Vídeo 2 de 4: a reunião, da primeira pauta ao resultado registrado.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const V2: VideoTutorial = {
  id: "Tutorial2-Reuniao",
  numero: 2,
  titulo: "A reunião",
  cenas: [
    {
      id: "T2-01-Abertura",
      nome: "Abertura",
      fala:
        "Este vídeo mostra como conduzir a reunião pelo painel, da primeira pauta até o resultado registrado.",
      cartao: {
        titulo: "A reunião",
        subtitulo: "Tutorial da secretária · parte 2 de 4",
      },
      planos: [],
    },
    {
      id: "T2-02-Pautas",
      nome: "Listar as pautas",
      fala:
        "{pautas} Antes da reunião, liste as pautas no bloco Pautas, um cargo por linha. " +
        "{adicionar} Depois clique em Adicionar pautas. " +
        "{lista} Os nomes dos indicados você digita na hora, quando a pauta começar.",
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
      id: "T2-03-Comecar",
      nome: "Começar a pauta",
      fala:
        "{comecar} Na reunião, clique em Começar, no bloco Agora. " +
        "{telao} O telão mostra o cargo, e a comissão faz as indicações.",
      planos: [
        {
          em: "comecar",
          layout: "painel",
          painel: "painel-pautas-lista",
          foco: "painel-pautas-lista#comecar",
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
      id: "T2-04-Indicados",
      nome: "Digitar os indicados",
      fala:
        "{digitar} Digite cada nome indicado e aperte a tecla Enter. " +
        "{telao} Os nomes aparecem no telão durante a discussão. " +
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
      id: "T2-05-ComoVotar",
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
      id: "T2-06-Votacao",
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
      id: "T2-07-Faltam",
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
      id: "T2-08-Encerrar",
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
      id: "T2-09-Registrar",
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
      id: "T2-10-SimNao",
      nome: "Sim ou Não",
      fala:
        "{proxima} Depois, comece a próxima pauta e coloque em votação, como antes. " +
        "{simnao} Com um nome só, cada membro vota Sim ou Não. " +
        "{aprovado} O nome é aprovado quando recebe mais Sim do que Não.",
      planos: [
        {
          em: "proxima",
          layout: "painel",
          painel: "painel-registrado",
          foco: "painel-registrado#proxima",
          zoom: 1.6,
          cursor: "painel-registrado#proxima",
          clique: true,
          destaque: "painel-registrado#proxima",
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
      id: "T2-11-Mudancas",
      nome: "Mudança de planos",
      fala:
        "{adiar} A pauta precisa esperar? Antes de colocar em votação, clique em Deixar para depois e confirme. {volta} Ela volta para a lista, com os nomes. " +
        "{corrigir} Faltou um nome depois de abrir a votação? Clique em Corrigir indicados e confirme. " +
        "{apagados} Os votos dessa pauta são apagados, e ela volta às indicações para você acrescentar o nome. Depois coloque em votação de novo e confira o modo e o voto secreto. " +
        "{reabrir} Encerrou cedo demais? Clique em Reabrir e confirme. Se o resultado já foi registrado, clique antes em Desfazer registro. " +
        "{reaberta} A votação abre de novo, e todos votam outra vez.",
      planos: [
        {
          em: "adiar",
          layout: "painel",
          painel: "painel-indicacao-adiar",
          foco: "painel-indicacao-adiar#adiar",
          zoom: 1.5,
          cursor: "painel-indicacao-adiar#adiar",
          clique: true,
          destaque: "painel-indicacao-adiar#adiar",
          dialogo: { captura: "painel-indicacao-adiar" },
          rotulo: "Deixar para depois",
        },
        {
          em: "volta",
          painel: "painel-pautas-adiada",
          foco: "painel-pautas-adiada#comunicacao",
          zoom: 1.5,
          destaque: "painel-pautas-adiada#comunicacao",
          rotulo: "Volta para a lista",
        },
        {
          em: "corrigir",
          painel: "painel-votacao-corrigir",
          foco: "painel-votacao-corrigir#corrigir",
          zoom: 1.2,
          cursor: "painel-votacao-corrigir#corrigir",
          clique: true,
          destaque: "painel-votacao-corrigir#corrigir",
          dialogo: { captura: "painel-votacao-corrigir" },
          rotulo: "Corrigir indicados",
        },
        {
          // de volta às indicações, com o nome novo e a caixa do voto secreto marcada de novo
          em: "apagados",
          painel: "painel-secreto-marcado",
          foco: "painel-secreto-marcado#form",
          zoom: 1.4,
          destaque: "painel-secreto-marcado#secreto",
          rotulo: "De volta às indicações",
        },
        {
          em: "reabrir",
          painel: "painel-reabrir",
          foco: "painel-reabrir#reabrir",
          zoom: 1.5,
          cursor: "painel-reabrir#reabrir",
          clique: true,
          destaque: "painel-reabrir#reabrir",
          dialogo: { captura: "painel-reabrir" },
          rotulo: "Reabrir a votação",
        },
        {
          em: "reaberta",
          painel: "painel-reaberto",
          foco: "painel-reaberto#agora",
          zoom: 1.4,
          rotulo: "Votação aberta de novo",
        },
      ],
    },
    {
      id: "T2-12-Imprevistos",
      nome: "Imprevistos",
      fala:
        "{atrasado} Alguém chegou atrasado? O quê erre pequeno, no canto do telão, já serve. " +
        "{grande} Se precisar dele grande, clique em Mostrar o quê erre no telão. " +
        "{voltar} Depois clique em Voltar à votação no telão. " +
        "{volta} O telão volta a mostrar a votação. " +
        "{conexao} Se aparecer o aviso que diz Sem conexão, espere. O painel tenta de novo sozinho, e os votos já registrados não se perdem. " +
        "{fora} Surgiu uma pauta fora da lista? Com o resultado da anterior registrado, escreva o cargo no campo chamado Pauta que não estava na lista. Depois clique em Criar e começar. " +
        "{criada} A pauta começa na hora, pronta para as indicações.",
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
        {
          em: "conexao",
          layout: "painel",
          painel: "painel-sem-conexao",
          foco: "painel-sem-conexao#aviso",
          zoom: 1.4,
          destaque: "painel-sem-conexao#aviso",
          rotulo: "Sem conexão",
        },
        {
          em: "fora",
          painel: "painel-fora-da-lista",
          foco: "painel-fora-da-lista#campo",
          zoom: 1.5,
          cursor: "painel-fora-da-lista#criar",
          clique: true,
          destaque: "painel-fora-da-lista#campo",
          rotulo: "Pauta fora da lista",
        },
        {
          em: "criada",
          painel: "painel-pauta-criada",
          foco: "painel-pauta-criada#agora",
          zoom: 1.4,
          destaque: "painel-pauta-criada#campo",
          rotulo: "Pauta criada",
        },
      ],
    },
    {
      id: "T2-13-Fim",
      nome: "Fim",
      fala:
        "{fim} No próximo vídeo, os outros modos de votação, o voto secreto e a abstenção.",
      cartao: {
        titulo: "Reunião conduzida",
        subtitulo: "Próximo vídeo: outros modos de votação",
      },
      planos: [],
    },
  ],
};
