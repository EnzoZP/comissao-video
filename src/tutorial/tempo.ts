// Tempo do tutorial: tudo sai da fala de cada cena.
//
// Duração (pedido do usuário): palavras ÷ 2,5 + 0,5 s de respiro → 12 quadros por palavra
// + 15 quadros, exato a 30 fps.
//
// Quando algo aparece: a fala tem marcas {nome} no começo de frase. Na mesma régua da
// duração (2,5 palavras/s), a frase da marca começa no quadro 12 × palavras antes dela; o
// visual tem de estar COMPLETO 6 quadros antes disso. A animação começa antes, e o resultado
// de um clique só aparece na frase seguinte (ver Palco). Uma régua mais rápida aqui não
// protegeria um áudio gerado num bloco só por vídeo, cuja defasagem se acumula de cena em
// cena: o que resolve é o áudio ter a duração do vídeo.
//
// Com a narração gravada (campo voz da cena, medido do áudio por scripts/tutorial/medir-voz.mjs
// e posto na cena pelo Root.tsx), a régua passa a ser a própria voz: a cena dura o áudio mais o
// respiro, e a palavra n cai no quadro interpolado entre os começos de frase medidos. Sem voz
// (o roteiro, o Node), vale a régua de 2,5 palavras/s.
//
// Este arquivo é importado também por scripts/tutorial/gerar-roteiro.mjs (Node, sem bundler):
// nada de import de valor, só sintaxe que o Node apaga.

export const FPS = 30;
export const LARGURA = 1920;
export const ALTURA = 1080;

const QUADROS_POR_PALAVRA = 12; // 30 / 2,5
const RESPIRO = 15; // 0,5 s
const FOLGA = 6;
// Saída curta de cada cena, dentro do respiro (a última cena não sai).
export const SAIDA_DA_CENA = 8;

export type Aparelho = "painel" | "telao" | "celular" | "folha";

// Retângulo em px CSS da captura (o mesmo sistema do boundingBox do Playwright).
export type Caixa = { x: number; y: number; w: number; h: number };

// Um alvo é "idDaCaptura#nomeDoAlvo", conferido contra src/tutorial/capturas.json.
export type Alvo = string;

export type Layout =
  | "painel"
  | "telao"
  | "celular"
  | "painel+telao"
  | "celular+telao"
  | "painel+celular"
  | "folha"
  | "folha-larga"; // a folha ocupando a largura do vídeo, para ler de perto

export type Plano = {
  // Marca da fala em que este plano tem de estar completo; "inicio" = quadro 0.
  em: string;
  layout?: Layout;
  // Captura mostrada em cada aparelho (id do capturas.json). Omitido = mantém a anterior.
  painel?: string;
  telao?: string;
  celular?: string;
  folha?: string; // documento impresso (ata, lista), mostrado como papel
  // Câmera: zoom no alvo (ou na captura inteira, se omitido) do aparelho principal.
  foco?: Alvo;
  zoom?: number;
  // Cursor do mouse até o alvo; clique logo depois da marca.
  cursor?: Alvo;
  clique?: boolean;
  // Dedo no celular.
  toque?: Alvo;
  // Anel de destaque no alvo.
  destaque?: Alvo;
  // Faixa de baixo, duas a quatro palavras.
  rotulo?: string;
  // Captura "preenchida" revelada de cima para baixo dentro do alvo (digitação).
  digitar?: { alvo: Alvo; de: string };
  // Diálogo nativo, que não sai em captura: o texto é o que o app mostrou naquela captura
  // (campo "dialogo" do capturas.json, ou outro campo indicado). Aparece logo depois do clique.
  dialogo?: { captura: string; campo?: string };
  // Janela de impressão do navegador ao lado da folha.
  impressao?: boolean;
  // Celular mostrando a câmera apontada para o QR do telão.
  camera?: Alvo;
  // Barra de janela do Mac sobre o telão, com o anel no botão verde (tela cheia no Mac).
  janelaMac?: boolean;
};

// Abertura e fim de cada vídeo: título grande e, se houver, itens que entram cada um na sua
// marca.
export type Cartao = {
  titulo: string;
  subtitulo: string;
  itens?: { em: string; icone: "computador" | "telao" | "celular"; texto: string }[];
};

// Narração gravada da cena, medida do áudio: duração em quadros e, para cada começo de frase,
// [índice da primeira palavra, quadro em que ela começa], do começo ao fim da fala.
export type VozDaCena = { texto: string; quadros: number; frases: [number, number][] };

export type CenaTutorial = {
  id: string; // id da composição avulsa (sem acento nem espaço)
  nome: string; // nome da Sequence e da cena no roteiro-narracao.md
  fala: string;
  cartao?: Cartao;
  planos: Plano[];
  voz?: VozDaCena;
};

export type VideoTutorial = {
  id: string; // id da composição (sem acento nem espaço)
  numero: number;
  titulo: string;
  cenas: CenaTutorial[];
};

const MARCA = /\{([a-z0-9-]+)\}/g;
const PALAVRA = /\p{L}+(?:-\p{L}+)*/gu;

// Texto que vai para o TTS: sem as marcas, espaços normalizados.
export const textoFalado = (fala: string) =>
  fala.replace(MARCA, " ").replace(/\s+/g, " ").trim();

export const contarPalavras = (texto: string) =>
  (texto.match(PALAVRA) ?? []).length;

export const quadrosDaCena = (cena: { fala: string; voz?: VozDaCena }) =>
  (cena.voz ? cena.voz.quadros : contarPalavras(textoFalado(cena.fala)) * QUADROS_POR_PALAVRA) +
  RESPIRO;

export const segundosDaCena = (cena: { fala: string; voz?: VozDaCena }) =>
  quadrosDaCena(cena) / FPS;

// Quadro em que a palavra n (contada do começo da fala) começa a ser dita.
export const quadroDaPalavra = (cena: { voz?: VozDaCena }, n: number) => {
  const frases = cena.voz?.frases;
  if (!frases) return n * QUADROS_POR_PALAVRA;
  const depois = frases.findIndex(([palavra]) => palavra > n);
  if (depois <= 0) return frases[depois < 0 ? frases.length - 1 : 0][1];
  const [p0, q0] = frases[depois - 1];
  const [p1, q1] = frases[depois];
  return Math.round(q0 + ((q1 - q0) * (n - p0)) / (p1 - p0));
};

export const marcasDa = (fala: string) => {
  const marcas: string[] = [];
  fala.replace(MARCA, (_, nome: string) => {
    marcas.push(nome);
    return "";
  });
  return marcas;
};

// Palavras ditas antes da marca.
export const palavrasAntes = (cena: { id: string; fala: string }, marca: string) => {
  if (marca === "inicio") return 0;
  const posicao = cena.fala.indexOf(`{${marca}}`);
  if (posicao < 0) throw new Error(`Marca {${marca}} não está na fala de ${cena.id}`);
  return contarPalavras(textoFalado(cena.fala.slice(0, posicao)));
};

// Palavra (contada a partir da marca) em que a frase manda agir: o clique ou o toque do
// plano acontece depois dela, nunca antes de a narração mandar clicar. Sem verbo, 0.
const CLICAR = /^(clique|toque|toca|aperte)$/i;
const CONFIRMAR = /^(confirme|marque|escolha)$/i;
export const palavrasAteAcao = (cena: { fala: string }, marca: string) => {
  const inicio = marca === "inicio" ? 0 : cena.fala.indexOf(`{${marca}}`) + marca.length + 2;
  const resto = cena.fala.slice(Math.max(0, inicio));
  const proxima = resto.search(/\{[a-z0-9-]+\}/);
  const trecho = proxima >= 0 ? resto.slice(0, proxima) : resto;
  const palavras = textoFalado(trecho).match(PALAVRA) ?? [];
  const i = palavras.findIndex((w) => CLICAR.test(w));
  const j = palavras.findIndex((w) => CONFIRMAR.test(w));
  return i >= 0 ? i : Math.max(0, j);
};

// Quadro em que o visual da marca tem de estar completo.
export const quadroDaMarca = (cena: { id: string; fala: string; voz?: VozDaCena }, marca: string) =>
  marca === "inicio" ? 0 : Math.max(0, quadroDaPalavra(cena, palavrasAntes(cena, marca)) - FOLGA);

export const quadrosDoVideo = (video: VideoTutorial) =>
  video.cenas.reduce((soma, cena) => soma + quadrosDaCena(cena), 0);

// Quadros da troca de layout; termina em T do plano que a pede.
export const TRANSICAO_LAYOUT = 18;
// Quadros da troca de captura no mesmo aparelho (fusão); termina em T.
export const TROCA = 6;

export type PlanoT = Plano & { T: number; acao?: number };

// Linha do tempo da cena: T de cada plano e, nos que clicam ou tocam, o quadro da ação.
// O Palco desenha por ela e a conferência dos quadros escolhe os instantes por ela.
export const linhaDoTempo = (cena: CenaTutorial): PlanoT[] => {
  const fim = quadrosDaCena(cena) - RESPIRO;
  const planos: PlanoT[] = cena.planos.map((p) => ({
    ...p,
    T: quadroDaMarca(cena, p.em),
  }));
  planos.forEach((p, i) => {
    if (i === 0 && p.T !== 0) {
      throw new Error(`${cena.id}: o primeiro plano tem de valer no quadro 0`);
    }
    if (i > 0 && p.T < planos[i - 1].T) {
      throw new Error(`${cena.id}: plano {${p.em}} antes do anterior`);
    }
    if ((p.cursor && p.clique) || p.toque) {
      const proximo = i + 1 < planos.length ? planos[i + 1].T - TRANSICAO_LAYOUT : fim;
      // depois de a frase dizer "clique" (o quadro em que a palavra começa, pela régua da cena);
      // com diálogo, cedo o bastante para ele ficar uns 2 s na tela; sempre antes do próximo plano
      // (com diálogo, o clique cai na própria palavra, para a confirmação ter mais tempo)
      const depoisDoVerbo =
        (cena.voz
          ? quadroDaPalavra(cena, palavrasAntes(cena, p.em) + palavrasAteAcao(cena, p.em))
          : p.T + FOLGA + QUADROS_POR_PALAVRA * palavrasAteAcao(cena, p.em)) + (p.dialogo ? 4 : 10);
      const acao = Math.max(depoisDoVerbo, proximo - (p.dialogo ? 84 : 16));
      p.acao = Math.max(p.T + 8, Math.min(acao, proximo - 12));
    }
  });
  return planos;
};

// T do primeiro plano depois de i que satisfaz o critério (ou "nunca").
export const proximoT = (planos: PlanoT[], i: number, criterio: (q: PlanoT) => boolean) => {
  for (let j = i + 1; j < planos.length; j++) if (criterio(planos[j])) return planos[j].T;
  return 1e6;
};

// Quando o diálogo desenhado do plano i aparece, quando o OK é apertado e quando ele sai. Fica
// até a tela trocar (antes da transição, se o layout muda; senão, até a troca da captura do
// aparelho do diálogo, ou o fim da cena); o OK é apertado pouco antes disso, se o diálogo ficou
// tempo bastante para ler. O Palco desenha por aqui e a conferência dos quadros amostra por aqui.
export const momentosDoDialogo = (planos: PlanoT[], i: number, ap: Aparelho, fimDaCena: number) => {
  const p = planos[i];
  const aparece = (p.acao ?? p.T) + 6;
  const saiLayout = proximoT(planos, i, (q) => q.layout !== undefined) - TRANSICAO_LAYOUT;
  const saiCaptura = proximoT(planos, i, (q) => q[ap] !== undefined) - TROCA - 2;
  const saiAntes = Math.min(saiLayout, saiCaptura, fimDaCena - SAIDA_DA_CENA - 4);
  const confirma = saiAntes - 14 >= aparece + 24 ? saiAntes - 14 : undefined;
  // sai depois do aperto do OK (escuro e pulso por uns 12 quadros), ainda antes de a tela trocar
  return { aparece, confirma, sai: confirma === undefined ? saiAntes : confirma + 12 };
};
