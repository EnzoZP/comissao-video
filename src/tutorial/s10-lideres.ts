// Secretária, vídeo 10: os eleitos, a resposta de cada um e a lista para ler à igreja.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S10: VideoTutorial = {
  id: "S10-Lideres",
  numero: 10,
  titulo: "Cargos e líderes",
  cenas: [
    {
      id: "S10-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra o que fazer com os eleitos, em Cargos e líderes.",
      cartao: { titulo: "Cargos e líderes", subtitulo: "Tutorial da secretária · vídeo 10" },
      planos: [],
    },
    {
      id: "S10-02-Lideres",
      nome: "Cargos e líderes",
      fala:
        "{link} No alto do painel, clique em Cargos e líderes. " +
        "{lista} Ali estão os cargos da igreja, na ordem, com quem foi eleito para cada um. " +
        "{resposta} Quando a pessoa responder, clique em Aceitou ou em Recusou. " +
        "{aceitou} A resposta aparece ao lado do nome.",
      planos: [
        {
          em: "link",
          layout: "painel",
          painel: "painel-barra-lideres",
          foco: "painel-barra-lideres#barra",
          zoom: 1.4,
          cursor: "painel-barra-lideres#lideres",
          clique: true,
          destaque: "painel-barra-lideres#lideres",
          rotulo: "Cargos e líderes",
        },
        // a página inteira: o título Cargos e líderes confirma o clique, e nada sai cortado no topo
        { em: "lista", painel: "lideres-topo", rotulo: "Cargos e eleitos" },
        {
          em: "resposta",
          painel: "lideres-musica",
          foco: "lideres-musica#linha",
          zoom: 1.4,
          cursor: "lideres-musica#aceitou",
          clique: true,
          destaque: "lideres-musica#aceitou",
          rotulo: "Aceitou ou Recusou",
        },
        {
          em: "aceitou",
          painel: "lideres-aceitou",
          foco: "lideres-aceitou#linha",
          zoom: 1.4,
          destaque: "lideres-aceitou#linha",
          rotulo: "Resposta registrada",
        },
      ],
    },
    {
      id: "S10-03-Recusou",
      nome: "Quando alguém recusa",
      fala:
        "{recusou} Se a pessoa recusar, clique em Recusou e confirme na janela que aparece. " +
        "{vaga} A vaga volta para a lista de pautas do painel, e a comissão vota de novo.",
      planos: [
        {
          em: "recusou",
          layout: "painel",
          painel: "lideres-rute",
          foco: "lideres-rute#linha",
          zoom: 1.4,
          cursor: "lideres-rute#recusou",
          clique: true,
          destaque: "lideres-rute#recusou",
          dialogo: { captura: "lideres-rute" },
          rotulo: "Quando alguém recusa",
        },
        {
          em: "vaga",
          painel: "painel-pauta-vaga",
          foco: "painel-pauta-vaga#vaga",
          zoom: 1.5,
          destaque: "painel-pauta-vaga#vaga",
          rotulo: "Vaga de quem recusou",
        },
      ],
    },
    {
      id: "S10-04-Decididos",
      nome: "Nomes já decididos",
      fala:
        "{definir} Algum cargo já foi decidido antes? Escreva o nome no campo escrito A definir e clique em Salvar. " +
        "{salvo} O nome entra na lista como aceito. " +
        "{anciao} No cargo de Ancião, informe quantas vagas existem e clique em Salvar. " +
        "{vagas} Aparece um campo para cada vaga. " +
        "{editar} Para mudar a lista de cargos, abra a caixa Editar a lista de cargos. " +
        "{tirar} Clique em Tirar no cargo que a igreja não tem e confirme. " +
        "{acrescentar} Para acrescentar um cargo, escreva o nome dele no campo Acrescentar cargo e clique em Acrescentar.",
      planos: [
        {
          em: "definir",
          layout: "painel",
          painel: "lideres-a-definir",
          digitar: { alvo: "lideres-a-definir#campo", de: "lideres-a-definir-vazio" },
          foco: "lideres-a-definir#campo",
          zoom: 1.4,
          destaque: "lideres-a-definir#campo",
          cursor: "lideres-a-definir#salvar",
          clique: true,
          rotulo: "Nome já decidido",
        },
        {
          em: "salvo",
          painel: "lideres-definido",
          foco: "lideres-definido#linha",
          zoom: 1.4,
          destaque: "lideres-definido#linha",
          rotulo: "Entra como aceito",
        },
        {
          em: "anciao",
          painel: "lideres-anciao-vagas",
          digitar: { alvo: "lideres-anciao-vagas#vagas", de: "lideres-anciao-vagas-vazio" },
          foco: "lideres-anciao-vagas#vagas",
          zoom: 1.2,
          destaque: "lideres-anciao-vagas#vagas",
          cursor: "lideres-anciao-vagas#salvar",
          clique: true,
          rotulo: "Vagas do Ancião",
        },
        // 1.1: a borda de cima cai entre o cabeçalho e o cartão, sem cortar o botão Lista para ler à igreja
        { em: "vagas", painel: "lideres-anciao", foco: "lideres-anciao#cargos", zoom: 1.1, rotulo: "Um campo por vaga" },
        {
          em: "editar",
          painel: "lideres-editar",
          foco: "lideres-editar#editar",
          zoom: 1.4,
          destaque: "lideres-editar#editar",
          rotulo: "Editar a lista de cargos",
        },
        {
          em: "tirar",
          cursor: "lideres-editar#tirarPossibilidades",
          clique: true,
          destaque: "lideres-editar#tirarPossibilidades",
          dialogo: { captura: "lideres-editar" },
          rotulo: "Tirar um cargo",
        },
        {
          em: "acrescentar",
          painel: "lideres-acrescentar-digitado",
          digitar: { alvo: "lideres-acrescentar-digitado#campo", de: "lideres-acrescentar" },
          foco: "lideres-acrescentar-digitado#acrescentar",
          zoom: 1.4,
          destaque: "lideres-acrescentar-digitado#acrescentar",
          cursor: "lideres-acrescentar-digitado#botao",
          rotulo: "Acrescentar cargo",
        },
      ],
    },
    {
      id: "S10-05-ListaIgreja",
      nome: "Lista para ler à igreja",
      fala:
        "{botao} Para anunciar os nomes, clique em Lista para ler à igreja. " +
        "{folha} A janela de impressão abre com a lista. Ela mostra cada cargo, o nome da pessoa e se ela já aceitou. Imprima ou salve como pê dê éfe.",
      planos: [
        {
          em: "botao",
          layout: "painel",
          painel: "lideres-botao-lista",
          // 1.2: o botão fica à esquerda da página; mais zoom corta o topo e os campos à direita
          foco: "lideres-botao-lista#lista",
          zoom: 1.2,
          cursor: "lideres-botao-lista#lista",
          clique: true,
          destaque: "lideres-botao-lista#lista",
          rotulo: "Lista para a igreja",
        },
        {
          // a folha na largura do vídeo: as três colunas legíveis, de Diácono (aguardando) até
          // Música (aceitou)
          em: "folha",
          layout: "folha-larga",
          folha: "folha-lista-igreja",
          foco: "folha-lista-igreja#trecho",
          zoom: 1,
          destaque: "folha-lista-igreja#saude",
          rotulo: "Cargo, nome e situação",
        },
      ],
    },
    {
      id: "S10-06-Fim",
      nome: "Fim",
      fala: "{fim} No próximo vídeo, a ata e o fim do trabalho da comissão.",
      cartao: { titulo: "Cargos e líderes", subtitulo: "Próximo vídeo: a ata" },
      planos: [],
    },
  ],
};
