// Gera roteiro-narracao.md a partir das falas dos vídeos (src/tutorial/s*.ts e m1-celular.ts) e
// confere se cada fala está pronta para TTS. Rode antes de cada render:
//   node scripts/tutorial/gerar-roteiro.mjs
//   node scripts/tutorial/gerar-roteiro.mjs --so-falas   sem conferir as capturas
// Sai com erro se alguma fala tiver dígito, símbolo, sigla ou marca fora do começo de frase,
// ou se um plano apontar para uma marca que não existe.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  FPS, contarPalavras, marcasDa, quadrosDaCena, textoFalado,
} from '../../src/tutorial/tempo.ts';
import { VIDEOS } from '../../src/tutorial/videos.ts';

const RAIZ = path.resolve(import.meta.dirname, '../..');
// --so-falas: confere só as falas e as marcas, antes de as capturas existirem
const SO_FALAS = process.argv.includes('--so-falas');
const CAPTURAS = JSON.parse(await readFile(path.join(RAIZ, 'src/tutorial/capturas.json'), 'utf8'));
const APARELHOS = ['painel', 'telao', 'celular', 'folha'];

const problemas = [];
const avisos = [];

// Só letras, espaço e a pontuação que o TTS lê como pausa.
const PERMITIDO = /^[\p{L}\s.,?!-]*$/u;
const SIGLA = /\b\p{Lu}{2,}\b/u;
const ABREVIACOES = /\b(ex|etc|sr|sra|dr|dra|obs|pág|nº|n°|min|seg|aprox)\b\.?/iu;

function conferirFala(video, cena) {
  const onde = `${video.id} › ${cena.id}`;
  const falado = textoFalado(cena.fala);
  if (!PERMITIDO.test(falado)) {
    const ruins = [...new Set(falado.replace(/[\p{L}\s.,?!-]/gu, ''))].join(' ');
    problemas.push(`${onde}: caractere que o TTS não deve ler: ${ruins}`);
  }
  if (SIGLA.test(falado)) problemas.push(`${onde}: sigla em maiúsculas: ${falado.match(SIGLA)[0]}`);
  if (ABREVIACOES.test(falado)) problemas.push(`${onde}: abreviação: ${falado.match(ABREVIACOES)[0]}`);
  // Marca só no começo da fala ou logo depois de um fim de frase.
  for (const m of cena.fala.matchAll(/\{([a-z0-9-]+)\}/g)) {
    const antes = cena.fala.slice(0, m.index).trimEnd();
    if (antes && !/[.?!]$/.test(antes)) problemas.push(`${onde}: marca {${m[1]}} no meio de frase`);
  }
  const marcas = marcasDa(cena.fala);
  const repetidas = marcas.filter((m, i) => marcas.indexOf(m) !== i);
  if (repetidas.length) problemas.push(`${onde}: marca repetida: ${repetidas.join(', ')}`);
  // Cada marca é usada por um plano ou por um item do cartão, e todo plano tem marca.
  const usadas = new Set([
    ...cena.planos.map((p) => p.em),
    ...(cena.cartao?.itens ?? []).map((i) => i.em),
  ]);
  for (const p of cena.planos) {
    if (p.em !== 'inicio' && !marcas.includes(p.em)) problemas.push(`${onde}: plano em {${p.em}}, que não está na fala`);
  }
  if (cena.cartao) return;
  if (!cena.planos.length) {
    avisos.push(`${onde}: ainda sem planos`);
    return;
  }
  for (const m of marcas) if (!usadas.has(m)) problemas.push(`${onde}: marca {${m}} sem plano`);
  const primeiro = cena.planos[0];
  const comecoDaFala = cena.fala.trimStart().startsWith(`{${primeiro.em}}`);
  if (primeiro.em !== 'inicio' && !comecoDaFala) problemas.push(`${onde}: o primeiro plano não vale no quadro 0`);
  if (!primeiro.layout) problemas.push(`${onde}: o primeiro plano não diz o layout`);
  if (!SO_FALAS) conferirCapturas(onde, cena);
}

// Toda captura e todo alvo citados num plano existem no capturas.json, no aparelho certo, e o alvo
// é da captura que o aparelho mostra naquele plano (o Palco ignora em silêncio um alvo de outra).
function conferirCapturas(onde, cena) {
  const temCaptura = (id, aparelho) => {
    const c = CAPTURAS[id];
    if (!c) return problemas.push(`${onde}: captura inexistente ${id}`);
    if (aparelho && c.aparelho !== aparelho) problemas.push(`${onde}: ${id} é de ${c.aparelho}, não de ${aparelho}`);
  };
  const temAlvo = (ref) => {
    const [id, nome] = String(ref).split('#');
    if (!CAPTURAS[id]) return problemas.push(`${onde}: captura inexistente em ${ref}`);
    if (!CAPTURAS[id].alvos[nome]) problemas.push(`${onde}: alvo inexistente ${ref}`);
  };
  for (const p of cena.planos) {
    for (const ap of APARELHOS) if (p[ap] !== undefined) temCaptura(p[ap], ap);
    for (const campo of ['foco', 'cursor', 'toque', 'destaque', 'camera']) if (p[campo]) temAlvo(p[campo]);
    if (p.digitar) { temAlvo(p.digitar.alvo); temCaptura(p.digitar.de); }
    if (p.dialogo) {
      temCaptura(p.dialogo.captura);
      if (CAPTURAS[p.dialogo.captura] && !CAPTURAS[p.dialogo.captura][p.dialogo.campo ?? 'dialogo']) {
        problemas.push(`${onde}: ${p.dialogo.captura} sem texto de diálogo`);
      }
    }
    if (p.clique && !p.cursor) problemas.push(`${onde}: clique sem cursor em {${p.em}}`);
  }
  cena.planos.forEach((p, i) => {
    const refs = ['foco', 'cursor', 'toque', 'destaque'].map((campo) => [campo, p[campo]]);
    if (p.digitar) refs.push(['digitar', p.digitar.alvo]);
    for (const [campo, ref] of refs) {
      if (!ref) continue;
      const id = String(ref).split('#')[0];
      const aparelho = CAPTURAS[id]?.aparelho;
      if (!aparelho) continue; // já apontado acima
      let mostrada;
      for (const q of cena.planos.slice(0, i + 1)) if (q[aparelho] !== undefined) mostrada = q[aparelho];
      if (mostrada !== id) problemas.push(`${onde}: ${campo} ${ref} em {${p.em}}, mas o ${aparelho} mostra ${mostrada ?? 'nada'}`);
    }
  });
}

const mmss = (quadros) => {
  const s = Math.floor(quadros / FPS);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const segundos = (quadros) => (quadros / FPS).toFixed(1).replace('.', ',');

const partes = [];
const corridos = [];
const resumo = [];
for (const video of VIDEOS) {
  let inicio = 0;
  const secoes = [];
  let palavrasDoVideo = 0;
  video.cenas.forEach((cena, i) => {
    conferirFala(video, cena);
    const quadros = quadrosDaCena(cena);
    const palavras = contarPalavras(textoFalado(cena.fala));
    palavrasDoVideo += palavras;
    secoes.push(
      `### ${i + 1}. ${cena.nome}\n\n` +
        `Início ${mmss(inicio)} · fim ${mmss(inicio + quadros)} · duração ${segundos(quadros)} s · ${palavras} palavras\n\n` +
        `${textoFalado(cena.fala)}\n`,
    );
    inicio += quadros;
  });
  partes.push(
    `## Vídeo ${video.numero}: ${video.titulo}\n\n` +
      `Composição \`${video.id}\` · duração total ${mmss(inicio)} (${segundos(inicio)} s) · ${video.cenas.length} cenas · ${palavrasDoVideo} palavras\n\n` +
      secoes.join('\n'),
  );
  corridos.push(
    `### Vídeo ${video.numero}: ${video.titulo}\n\n` +
      // uma cena por parágrafo: a linha em branco é a pausa de meio segundo entre as cenas
      `${video.cenas.map((c) => textoFalado(c.fala)).join('\n\n')}\n`,
  );
  resumo.push(`${video.id}: ${mmss(inicio)} (${inicio} quadros, ${palavrasDoVideo} palavras)`);
}

const md =
  '# Roteiro de narração do tutorial\n\n' +
  'Doze vídeos da secretária e um do membro, cada um com as cenas na mesma ordem e com o mesmo nome das sequências do Remotion. ' +
  'Os tempos contam a partir do começo de cada vídeo. A duração de cada cena é o número de palavras dividido por 2,5, ' +
  'mais 0,5 s de respiro no fim. Início e fim estão em mm:ss, arredondados para baixo; a duração exata é a de cada ' +
  'cena, em segundos com uma casa, e as cenas vêm uma depois da outra, sem intervalo.\n\n' +
  'Este arquivo é gerado por `node scripts/tutorial/gerar-roteiro.mjs` a partir de `src/tutorial/s01-primeiro-acesso.ts` a ' +
  '`s12-feedback.ts` e `m1-celular.ts`. Para mudar uma fala, mude lá e gere de novo: o vídeo e este roteiro saem da mesma fonte.\n\n' +
  partes.join('\n') +
  '\n## Texto corrido para o TTS\n\n' +
  'O jeito mais seguro é gerar um áudio por cena, com o texto de cada cena acima. Confira que a fala de cada ' +
  'cena termina antes do fim dela, com o meio segundo de respiro: a voz não pode ser mais lenta que duas palavras ' +
  'e meia por segundo, senão o clique e a troca de tela chegam antes da fala. Se passar, acelere a voz. ' +
  'Se preferir colar um bloco por vídeo, use os blocos abaixo: cada cena é um parágrafo, e a voz precisa fazer ' +
  'meio segundo de pausa na linha em branco entre eles, e o áudio de cada vídeo tem de dar a duração total indicada ' +
  'no começo da parte dele: se sair mais curto ou mais longo, ajuste a velocidade da voz até bater; se não bater, ' +
  'use um áudio por cena. Teste antes "app", "quê erre", "éfe onze", "pê dê éfe", "feedback", "e-mail", ' +
  '"Enter" e "Mac". Se a voz soletrar "app", troque por "aplicativo"; se "quê erre" soar como pergunta, teste ' +
  '"quê-erre"; se "éfe onze" ou "pê dê éfe" saírem errados, teste "efe onze" e "pê-dê-éfe". Faça essas trocas só ' +
  'no texto colado no app de TTS, sem mexer nos arquivos do vídeo. As outras palavras são nomes de botão ou de ' +
  'computador e ficam como estão.\n\n' +
  corridos.join('\n');

if (problemas.length) {
  console.error(`PROBLEMAS (${problemas.length}):\n  ${problemas.join('\n  ')}`);
  process.exitCode = 1;
} else {
  await writeFile(path.join(RAIZ, 'roteiro-narracao.md'), md);
  console.log(`roteiro-narracao.md gravado\n  ${resumo.join('\n  ')}`);
}
if (avisos.length) console.log(`avisos (${avisos.length}):\n  ${avisos.join('\n  ')}`);
