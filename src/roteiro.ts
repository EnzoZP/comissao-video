// Tabela das cenas: a única fonte da duração. Video.tsx, Root.tsx e a lista de tempos
// para a narração saem daqui.
export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;

export type Cena = {
  id: string;
  titulo: string;
  segundos: number;
};

export const CENAS = [
  { id: "C01-Abertura", titulo: "Abertura", segundos: 5 },
  {
    id: "C02-Painel",
    titulo: "Painel: nova pauta e entrada pelo QR",
    segundos: 10,
  },
  {
    id: "C03-QR",
    titulo: "Telão com o QR e o celular escaneando",
    segundos: 7,
  },
  {
    id: "C04-Nome",
    titulo: "Celular: toque no nome e todos entram",
    segundos: 9,
  },
  {
    id: "C05-Abrir",
    titulo: "Painel abre a votação e o telão muda",
    segundos: 7,
  },
  { id: "C06-Voto", titulo: "Celular: voto SIM", segundos: 6 },
  { id: "C07-Cascata", titulo: "Os 21 votos chegando", segundos: 11 },
  { id: "C08-Resultado", titulo: "Encerrar votação: APROVADO", segundos: 8 },
  { id: "C09-Empate", titulo: "Pauta de nomes: EMPATE", segundos: 9 },
  { id: "C10-Ata", titulo: "Ata em PDF e no Word", segundos: 9 },
  { id: "C11-Fechamento", titulo: "Fechamento", segundos: 5 },
] as const satisfies readonly Cena[];

// Id de cena como tipo: cena sem componente em Video.tsx vira erro de compilação.
export type CenaId = (typeof CENAS)[number]["id"];

export const quadros = (segundos: number) => Math.round(segundos * FPS);

export const DURACAO_TOTAL = CENAS.reduce(
  (soma, c) => soma + quadros(c.segundos),
  0,
);

// Quadros da saída rápida no fim de cada cena. O respiro de ~1,5 s antes dela é
// garantido pelos tempos de cada cena e conferido nos stills.
export const SAIDA = 10;
