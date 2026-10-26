// Secretária, vídeo 8: mudanças de plano e imprevistos da reunião.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S08: VideoTutorial = {
  id: "S08-Imprevistos",
  numero: 8,
  titulo: "Imprevistos",
  cenas: [
    {
      id: "S08-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra o que fazer quando a reunião muda de rumo.",
      cartao: { titulo: "Imprevistos", subtitulo: "Tutorial da secretária · vídeo 8" },
      planos: [],
    },
    {
      id: "S08-02-Adiar",
      nome: "Deixar para depois",
      fala:
        "{adiar} A pauta precisa esperar? Antes de colocar em votação, clique em Deixar para depois e confirme. " +
        "{volta} Ela volta para a lista, com os nomes.",
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
      ],
    },
    {
      id: "S08-03-Corrigir",
      nome: "Corrigir indicados",
      fala:
        "{corrigir} Faltou um nome depois de abrir a votação? Clique em Corrigir indicados e confirme. Isso vale só na primeira rodada. " +
        "{apagados} Os votos dessa pauta são apagados, e ela volta às indicações para você acrescentar o nome. Depois coloque em votação de novo e confira o modo e o voto secreto.",
      planos: [
        {
          em: "corrigir",
          layout: "painel",
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
      ],
    },
    {
      id: "S08-04-Reabrir",
      nome: "Reabrir a votação",
      fala:
        "{reabrir} Encerrou cedo demais? Clique em Reabrir e confirme. Se o resultado já foi registrado, clique antes em Desfazer registro. " +
        "{reaberta} A votação abre de novo, e todos votam outra vez.",
      planos: [
        {
          em: "reabrir",
          layout: "painel",
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
      id: "S08-05-Conexao",
      nome: "Sem conexão",
      fala:
        "{conexao} Se aparecer o aviso que diz Sem conexão, espere. O painel tenta de novo sozinho, e os votos já registrados não se perdem.",
      planos: [
        {
          em: "conexao",
          layout: "painel",
          painel: "painel-sem-conexao",
          foco: "painel-sem-conexao#aviso",
          zoom: 1.4,
          destaque: "painel-sem-conexao#aviso",
          rotulo: "Sem conexão",
        },
      ],
    },
    {
      id: "S08-06-ForaDaLista",
      nome: "Pauta fora da lista",
      fala:
        "{fora} Surgiu uma pauta fora da lista? Com o resultado da anterior registrado, escreva o cargo no campo chamado Pauta que não estava na lista. Depois clique em Criar e começar. " +
        "{criada} A pauta começa na hora, pronta para as indicações.",
      planos: [
        {
          em: "fora",
          layout: "painel",
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
      id: "S08-07-Fim",
      nome: "Fim",
      fala: "{fim} No próximo vídeo, o voto secreto, a abstenção e os outros modos de votação.",
      cartao: { titulo: "Imprevistos", subtitulo: "Próximo vídeo: modos de votação" },
      planos: [],
    },
  ],
};
