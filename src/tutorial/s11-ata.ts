// Secretária, vídeo 11: a ata, os votos nominais e o fim do trabalho da comissão.
// A fala é a fonte da duração e do roteiro-narracao.md (ver tempo.ts). Marcas {nome} só no
// começo de frase; o plano de cada marca fica completo quando a frase começa.
import type { VideoTutorial } from "./tempo";

export const S11: VideoTutorial = {
  id: "S11-Ata",
  numero: 11,
  titulo: "A ata e o fim do trabalho",
  cenas: [
    {
      id: "S11-01-Abertura",
      nome: "Abertura",
      fala: "Este vídeo mostra a ata de cada noite e como fechar o trabalho da comissão, guardando tudo.",
      cartao: { titulo: "A ata e o fim do trabalho", subtitulo: "Tutorial da secretária · vídeo 11" },
      planos: [],
    },
    {
      id: "S11-02-Ata",
      nome: "A ata",
      fala:
        "{ata} No fim da noite, abra a gaveta Depois da reunião e clique em Gerar ata. " +
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
      id: "S11-03-Encerrar",
      nome: "Assuntos encerrados",
      fala:
        "{entre} As pautas ficam guardadas de uma noite para outra. " +
        "{encerrar} Quando a comissão terminar todo o trabalho, clique em Assuntos encerrados, no fim da lista de Pautas, e confirme. Antes, não pode haver pauta em andamento. " +
        "{limpa} A ata vai para Atas antigas, e a lista de pautas fica limpa, inclusive as que não foram votadas. " +
        "{lideres} A lista de cargos e líderes continua.",
      planos: [
        {
          em: "entre",
          layout: "painel",
          painel: "painel-encerrar",
          foco: "painel-encerrar#coluna",
          zoom: 1.3,
          rotulo: "Pautas guardadas",
        },
        {
          em: "encerrar",
          foco: "painel-encerrar#linha",
          zoom: 1.6,
          cursor: "painel-encerrar#encerrar",
          clique: true,
          destaque: "painel-encerrar#encerrar",
          dialogo: { captura: "painel-encerrar" },
          rotulo: "Assuntos encerrados",
        },
        {
          em: "limpa",
          painel: "painel-encerrado",
          foco: "painel-encerrado#pautas",
          zoom: 1.3,
          destaque: "painel-encerrado#pautas",
          rotulo: "Lista limpa",
        },
        {
          em: "lideres",
          painel: "lideres-final",
          foco: "lideres-final#musica",
          zoom: 1.3,
          rotulo: "Os líderes continuam",
        },
      ],
    },
    {
      id: "S11-04-Antigas",
      nome: "Atas antigas",
      fala:
        "{antigas} Para imprimir de novo, abra a gaveta Depois da reunião e depois Atas antigas. " +
        "{botoes} Cada ata guardada tem a ata, os votos nominais e a planilha. Apagar tira a ata guardada de vez. " +
        "{apagar} O botão Apagar todas as pautas limpa a lista sem guardar a ata. Use só se não precisar dela.",
      planos: [
        {
          em: "antigas",
          layout: "painel",
          painel: "painel-atas-antigas",
          foco: "painel-atas-antigas#caixa",
          zoom: 1.4,
          destaque: "painel-atas-antigas#caixa",
          rotulo: "Atas antigas",
        },
        { em: "botoes", destaque: "painel-atas-antigas#ata", rotulo: "Ata, votos e planilha" },
        {
          em: "apagar",
          foco: "painel-atas-antigas#linha",
          zoom: 1.4,
          destaque: "painel-atas-antigas#apagar",
          rotulo: "Apagar sem guardar",
        },
      ],
    },
    {
      id: "S11-05-Fim",
      nome: "Fim",
      fala: "{fim} No último vídeo, o feedback da igreja pelo quê erre.",
      cartao: { titulo: "Trabalho guardado", subtitulo: "Próximo vídeo: o feedback" },
      planos: [],
    },
  ],
};
