// DADOS FICTÍCIOS. Todos os nomes, pautas, votos e datas deste arquivo foram inventados
// para o vídeo. Não são membros da igreja nem resultados reais.

export const MEMBROS = [
  "Ana Souza",
  "Bruno Lima",
  "Camila Reis",
  "Daniel Alves",
  "Débora Cruz",
  "Eduardo Melo",
  "Fábio Nunes",
  "Gabriela Dias",
  "Helena Prado",
  "Igor Santos",
  "Joana Lopes",
  "Lucas Barros",
  "Márcia Gomes",
  "Nelson Rocha",
  "Olívia Torres",
  "Paulo Mendes",
  "Renata Silva",
  "Sérgio Pires",
  "Tânia Moura",
  "Vitor Ramos",
  "Wagner Costa",
] as const;

// O membro que aparece com o celular na mão durante o vídeo.
export const EU = 15;

export type Opcao = "sim" | "nao" | number; // número = índice do candidato

export type Pauta = {
  cargo: string;
  candidatos: string[]; // um nome = votação Sim/Não; dois ou mais = escolher um
};

// "atraso" é em quadros, contado a partir do início da cascata de votos da cena.
export type Voto = { membro: number; opcao: Opcao; atraso: number };

export const PAUTA_JOVENS: Pauta = {
  cargo: "Diretor(a) de Jovens",
  candidatos: ["Mariana Freitas"],
};

export const PAUTA_TESOURARIA: Pauta = {
  cargo: "Tesoureiro(a)",
  candidatos: ["Carlos Almeida", "Fernanda Braga", "Rafael Duarte"],
};

const NAO_JOVENS = new Set([3, 6, 10, 13, 17, 19]);

// Ordem de chegada irregular, como numa reunião de verdade: o do Paulo é o primeiro e o
// último voto demora.
const CHEGADA_JOVENS: [number, number][] = [
  [15, 0],
  [2, 8],
  [7, 13],
  [0, 17],
  [11, 26],
  [3, 30],
  [18, 33],
  [5, 41],
  [12, 45],
  [16, 47],
  [8, 55],
  [10, 62],
  [1, 66],
  [20, 70],
  [14, 79],
  [6, 86],
  [9, 92],
  [4, 103],
  [13, 112],
  [19, 126],
  [17, 150],
];

export const VOTOS_JOVENS: Voto[] = CHEGADA_JOVENS.map(([membro, atraso]) => ({
  membro,
  atraso,
  opcao: NAO_JOVENS.has(membro) ? "nao" : "sim",
}));

// Tesouraria: 9 × 9 × 3, empate entre os dois primeiros.
const ESCOLHA_TESOURARIA: Record<number, number> = {
  0: 0,
  1: 0,
  3: 0,
  5: 0,
  8: 0,
  11: 0,
  13: 0,
  16: 0,
  19: 0,
  2: 1,
  4: 1,
  7: 1,
  9: 1,
  12: 1,
  14: 1,
  15: 1,
  18: 1,
  20: 1,
  6: 2,
  10: 2,
  17: 2,
};

const CHEGADA_TESOURARIA: [number, number][] = [
  [15, 0],
  [4, 3],
  [0, 6],
  [9, 9],
  [11, 11],
  [2, 14],
  [16, 17],
  [6, 20],
  [20, 23],
  [3, 26],
  [12, 29],
  [8, 32],
  [18, 35],
  [13, 38],
  [10, 41],
  [1, 44],
  [14, 48],
  [5, 52],
  [19, 56],
  [7, 60],
  [17, 65],
];

export const VOTOS_TESOURARIA: Voto[] = CHEGADA_TESOURARIA.map(
  ([membro, atraso]) => ({
    membro,
    atraso,
    opcao: ESCOLHA_TESOURARIA[membro],
  }),
);

// Entrada pelo QR: o Paulo entra primeiro e o resto da sala logo em seguida.
const ORDEM_ENTRADA = [
  15, 3, 8, 0, 12, 19, 5, 1, 17, 10, 6, 14, 2, 20, 9, 16, 4, 11, 18, 7, 13,
];
export const ENTRADAS = ORDEM_ENTRADA.map((membro, i) => ({
  membro,
  atraso: i === 0 ? 0 : 6 + i * 2,
}));

export const ehSimNao = (pauta: Pauta) => pauta.candidatos.length === 1;

// Opções na ordem em que o app mostra os botões e as barras.
export const opcoesDa = (pauta: Pauta): Opcao[] =>
  ehSimNao(pauta) ? ["sim", "nao"] : pauta.candidatos.map((_, i) => i);

export const rotuloDa = (pauta: Pauta, opcao: Opcao) =>
  opcao === "sim" ? "Sim" : opcao === "nao" ? "Não" : pauta.candidatos[opcao];

export const contar = (pauta: Pauta, votos: Voto[]) =>
  opcoesDa(pauta).map((opcao) => ({
    opcao,
    rotulo: rotuloDa(pauta, opcao),
    votos: votos.filter((v) => v.opcao === opcao).length,
  }));

// Regra do app: Sim/Não aprova só com mais Sim do que Não (empate reprova); na pauta de
// nomes ganha o mais votado, e empate no topo aparece como EMPATE.
export const resultadoDa = (pauta: Pauta, votos: Voto[]) => {
  const placar = contar(pauta, votos);
  if (ehSimNao(pauta)) {
    return placar[0].votos > placar[1].votos ? "APROVADO" : "NÃO APROVADO";
  }
  const maior = Math.max(...placar.map((p) => p.votos));
  const topo = placar.filter((p) => p.votos === maior);
  return topo.length > 1 ? "EMPATE" : topo[0].rotulo.toUpperCase();
};

// Dados da ata (fictícios).
export const ATA = {
  dia: "18 de outubro de 2026",
  encerradaJovens: "18/10/2026 19:42",
  encerradaTesouraria: "18/10/2026 19:57",
  gerada: "18/10/2026 20:05",
};
