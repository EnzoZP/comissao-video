// Vídeo 4 de 4: depois das votações. Eleitos, ata, apagar as pautas e feedback.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const V4: VideoTutorial = {
  id: "Tutorial4-Depois",
  numero: 4,
  titulo: "Depois da reunião",
  cenas: [
    {
      id: "T4-01-Abertura",
      nome: "Abertura",
      fala:
        "Este vídeo mostra o que fazer depois das votações, com os eleitos, a ata e o feedback.",
      cartao: {
        titulo: "Depois da reunião",
        subtitulo: "Tutorial da secretária · parte 4 de 4",
      },
      planos: [],
    },
    {
      id: "T4-02-Lideres",
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
      id: "T4-03-Recusou",
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
      id: "T4-04-Decididos",
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
      id: "T4-05-ListaIgreja",
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
      id: "T4-06-Ata",
      nome: "A ata",
      fala:
        "{ata} No fim da noite, abra o bloco Depois da reunião e clique em Gerar ata. " +
        "{salvar} Na janela de impressão, escolha Salvar como pê dê éfe. " +
        "{secreta} A ata não mostra o voto de cada um nas votações secretas. " +
        "{nominais} Esse voto sai nos Votos nominais e na planilha. " +
        "{restrito} Os dois são só da secretaria.",
      planos: [
        {
          em: "ata",
          layout: "painel",
          painel: "painel-depois",
          foco: "painel-depois#gerar",
          zoom: 1.4,
          cursor: "painel-depois#gerar",
          clique: true,
          destaque: "painel-depois#gerar",
          rotulo: "Gerar ata",
        },
        { em: "salvar", layout: "folha", folha: "folha-ata", impressao: true, rotulo: "Salvar como PDF" },
        {
          // a pauta aberta, com o voto de cada um, logo acima da secreta, que só tem o resultado
          em: "secreta",
          layout: "folha-larga",
          folha: "folha-ata",
          foco: "folha-ata#secreta",
          zoom: 1,
          destaque: "folha-ata#secreta",
          rotulo: "Voto secreto na ata",
        },
        {
          em: "nominais",
          layout: "painel",
          painel: "painel-depois",
          foco: "painel-depois#gerar",
          zoom: 1.4,
          destaque: "painel-depois#nominaisPlanilha",
          rotulo: "Votos nominais e planilha",
        },
        { em: "restrito", layout: "folha", folha: "folha-votos-nominais", rotulo: "Só da secretaria" },
      ],
    },
    {
      id: "T4-07-Apagar",
      nome: "Apagar as pautas",
      fala:
        "{apagar} Quando a comissão terminar todo o trabalho, gere a ata e só então clique em Apagar todas as pautas e confirme. Isso não dá para desfazer. " +
        "{continua} A lista de cargos e líderes continua guardada.",
      planos: [
        {
          // o mesmo enquadramento da ata: Gerar ata e Apagar todas as pautas lado a lado
          em: "apagar",
          layout: "painel",
          painel: "painel-depois",
          foco: "painel-depois#gerar",
          zoom: 1.4,
          cursor: "painel-depois#apagar",
          clique: true,
          destaque: "painel-depois#apagar",
          dialogo: { captura: "painel-depois", campo: "dialogoApagar" },
          rotulo: "Ata antes de apagar",
        },
        {
          em: "continua",
          painel: "lideres-final",
          foco: "lideres-final#musica",
          zoom: 1.3,
          rotulo: "Os líderes continuam",
        },
      ],
    },
    {
      id: "T4-08-Feedback",
      nome: "Feedback pelo QR",
      fala:
        "{feedback} No alto do painel, clique em Feedback. " +
        "{qr} Ali fica o quê erre fixo da igreja. Clique em Baixar imagem do quê erre e ponha na apresentação do culto. " +
        "{form} Quem escaneia escolhe o cargo e escreve. " +
        "{lido} Você lê tudo nessa tela, sem ver quem enviou. Repasse ao líder e clique em Marcar como lido. " +
        "{lidos} O recado passa para a aba Lidos.",
      planos: [
        {
          em: "feedback",
          layout: "painel",
          painel: "painel-apagado",
          foco: "painel-apagado#barra",
          zoom: 1.4,
          cursor: "painel-apagado#feedback",
          clique: true,
          destaque: "painel-apagado#feedback",
          rotulo: "Feedback",
        },
        {
          em: "qr",
          painel: "feedback-qr",
          foco: "feedback-qr#qr",
          zoom: 1.5,
          cursor: "feedback-qr#baixar",
          clique: true,
          destaque: "feedback-qr#baixar",
          rotulo: "QR fixo de feedback",
        },
        {
          em: "form",
          layout: "celular",
          celular: "celular-feedback",
          destaque: "celular-feedback#cargo",
          rotulo: "Cargo e recado",
        },
        {
          em: "lido",
          layout: "painel",
          painel: "feedback-lista",
          foco: "feedback-lista#lista",
          zoom: 1.4,
          cursor: "feedback-lista#lido",
          clique: true,
          destaque: "feedback-lista#lido",
          rotulo: "Marcar como lido",
        },
        {
          em: "lidos",
          painel: "feedback-lido",
          foco: "feedback-lido#abas",
          zoom: 1.4,
          destaque: "feedback-lido#lidos",
          rotulo: "Vai para Lidos",
        },
      ],
    },
    {
      id: "T4-09-Fim",
      nome: "Fim",
      fala:
        "{fim} Pronto. Agora você já sabe usar o app do começo ao fim. Bom trabalho na comissão.",
      cartao: {
        titulo: "Pronto",
        subtitulo: "Bom trabalho na comissão",
      },
      planos: [],
    },
  ],
};
