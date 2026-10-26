// Mede a narração gravada de cada cena e grava src/tutorial/voz.json, de onde o vídeo tira a
// duração das cenas e o quadro de cada marca. Rode depois de trocar algum áudio:
//   node scripts/tutorial/medir-voz.mjs
//
// Entrada: public/tutorial/voz/<id da cena>.wav, um por cena (gerados no ElevenLabs, voz Amanda, modelo eleven_v4).
// Para cada áudio, acha as pausas (silencedetect do ffmpeg que vem no Remotion) e casa cada
// começo de frase do texto com uma pausa: a mais perto da posição esperada (proporcional aos
// caracteres), em ordem e preferindo pausas longas, que são as de fim de frase. Frase sem pausa
// perto fica na posição esperada e aparece no relatório.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { FPS, contarPalavras, textoFalado } from '../../src/tutorial/tempo.ts';
import { VIDEOS } from '../../src/tutorial/videos.ts';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const PASTA = path.join(RAIZ, 'public/tutorial/voz');
const BIN = path.join(RAIZ, 'node_modules/@remotion/compositor-darwin-arm64');
const env = { ...process.env, DYLD_LIBRARY_PATH: BIN };

const JANELA = 1.5; // s: distância máxima entre a posição esperada da frase e a pausa
const PAUSA_MINIMA = 0.12; // s: pausa mais curta que conta (as de fim de frase ganham bônus por serem longas)

const duracao = (arq) =>
  Number(execFileSync(path.join(BIN, 'ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq], { env }));

const pausas = (arq) => {
  const r = spawnSync(path.join(BIN, 'ffmpeg'), ['-hide_banner', '-i', arq, '-af', 'silencedetect=noise=-38dB:d=0.1', '-f', 'null', '-'], { env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg falhou em ${arq}: ${r.stderr.slice(-300)}`);
  const lista = [];
  let inicio = null;
  for (const linha of r.stderr.split('\n')) {
    const a = linha.match(/silence_start: ([\d.]+)/);
    const b = linha.match(/silence_end: ([\d.]+)/);
    if (a) inicio = Number(a[1]);
    if (b) lista.push({ inicio: inicio ?? 0, fim: Number(b[1]) });
  }
  // silêncio que vai até o fim do arquivo não tem silence_end
  if (inicio !== null && (!lista.length || lista.at(-1).inicio !== inicio)) lista.push({ inicio, fim: Infinity });
  return lista;
};

// Começos de frase do texto: [índice da primeira palavra, caracteres antes].
const frasesDo = (texto) => {
  const frases = [];
  const re = /[.?!]\s+/g;
  let m;
  while ((m = re.exec(texto))) {
    const corte = m.index + m[0].length;
    if (corte < texto.length) frases.push({ palavra: contarPalavras(texto.slice(0, corte)), chars: corte });
  }
  return frases;
};

// Pausas separadas por um respiro curto viram uma só (o fim de frase costuma vir partido em dois).
const juntar = (lista) => {
  const juntas = [];
  for (const p of lista) {
    const ultima = juntas.at(-1);
    if (ultima && p.inicio - ultima.fim < 0.2) ultima.fim = p.fim;
    else juntas.push({ ...p });
  }
  return juntas;
};

// Casa os começos de frase (em ordem) com as pausas (em ordem). O custo de cada trecho entre dois
// começos casados é o erro relativo entre o tempo medido e o esperado pelo número de caracteres, no
// ritmo médio da cena; pausa longa ganha bônus, frase pulada (sem pausa) paga multa. Comparar o
// trecho, e não a posição absoluta, evita que o erro acumulado numa cena longa empurre as frases
// para as pausas de vírgula.
const casar = (chars, totalChars, candidatas, fala0, fala1) => {
  const n = chars.length;
  const ritmo = (fala1 - fala0) / totalChars;
  // nós: 0 = começo da fala; 1..n = frase j-1 casada com alguma pausa; fim = fim da fala
  const pontos = [{ j: -1, c: -1, t: fala0, ch: 0 }];
  chars.forEach((ch, j) => candidatas.forEach((p, c) => pontos.push({ j, c, t: p.fim, ch, bonus: Math.min(p.fim - p.inicio, 0.7) })));
  pontos.push({ j: n, c: -1, t: fala1, ch: totalChars });
  const custo = new Array(pontos.length).fill(Infinity);
  const veio = new Array(pontos.length).fill(-1);
  custo[0] = 0;
  for (let b = 1; b < pontos.length; b++) {
    const B = pontos[b];
    for (let a = 0; a < b; a++) {
      const A = pontos[a];
      if (!(A.j < B.j) || !(A.t < B.t) || (A.c >= 0 && B.c >= 0 && A.c >= B.c) || custo[a] === Infinity) continue;
      const esperado = (B.ch - A.ch) * ritmo;
      const erro = Math.abs(B.t - A.t - esperado);
      if (erro > Math.max(JANELA, 0.35 * esperado)) continue;
      const v = custo[a] + erro / Math.max(esperado, 1) + 0.3 * (B.j - A.j - 1) - 0.5 * (B.bonus ?? 0);
      if (v < custo[b]) { custo[b] = v; veio[b] = a; }
    }
  }
  const resultado = new Array(n).fill(-1);
  let b = pontos.length - 1;
  if (custo[b] === Infinity) return resultado;
  for (b = veio[b]; b > 0; b = veio[b]) resultado[pontos[b].j] = pontos[b].c;
  return resultado;
};

// Frase sem pausa casada: interpolada pelos caracteres entre as vizinhas casadas.
const interpolar = (tempos, chars, fala0, fala1, totalChars) => {
  const ancoras = [{ ch: 0, t: fala0 }, ...tempos.map((t, j) => (t === null ? null : { ch: chars[j], t })).filter(Boolean), { ch: totalChars, t: fala1 }];
  return tempos.map((t, j) => {
    if (t !== null) return t;
    const depois = ancoras.findIndex((a) => a.ch > chars[j]);
    const A = ancoras[depois - 1];
    const B = ancoras[depois];
    return A.t + ((B.t - A.t) * (chars[j] - A.ch)) / (B.ch - A.ch);
  });
};

const voz = {};
const relatorio = [];
const semAudio = [];
const falhas = [];
for (const video of VIDEOS) {
  for (const cena of video.cenas) {
    const arq = path.join(PASTA, `${cena.id}.wav`);
    if (!existsSync(arq)) { semAudio.push(cena.id); continue; }
    const texto = textoFalado(cena.fala);
    const total = contarPalavras(texto);
    const dur = duracao(arq);
    const lista = juntar(pausas(arq));
    // trecho falado: tira o silêncio do começo e do fim do arquivo
    const fala0 = lista.length && lista[0].inicio < 0.05 ? lista[0].fim : 0;
    const ultima = lista.at(-1);
    const fala1 = ultima && ultima.fim >= dur - 0.05 ? ultima.inicio : dur;
    const frases = frasesDo(texto);
    const chars = frases.map((f) => f.chars);
    const candidatas = lista.filter((p) => p.fim > fala0 + 0.1 && p.fim < fala1 && p.fim - p.inicio >= PAUSA_MINIMA);
    const casadas = casar(chars, texto.length, candidatas, fala0, fala1);
    const tempos = interpolar(casadas.map((c) => (c >= 0 ? candidatas[c].fim : null)), chars, fala0, fala1, texto.length);
    const q = (s) => Math.round(s * FPS);
    voz[cena.id] = {
      // o texto medido: o Root recusa a voz se a fala da cena mudar depois da gravação
      texto,
      quadros: Math.ceil(dur * FPS),
      frases: [[0, q(fala0)], ...frases.map((f, j) => [f.palavra, q(tempos[j])]), [total, q(fala1)]],
    };
    const soltas = casadas.filter((c) => c < 0).length;
    // nenhuma pausa casada numa cena com várias frases: o casamento falhou, não é caso parcial
    if (frases.length > 1 && soltas === frases.length) falhas.push(cena.id);
    relatorio.push(`${cena.id}: ${dur.toFixed(1)} s, ${frases.length + 1} frases, ${soltas ? `${soltas} sem pausa` : 'todas casadas'}`);
  }
}

const sobrando = readdirSync(PASTA).filter((f) => f.endsWith('.wav') && !voz[f.replace(/\.wav$/, '')]);
writeFileSync(path.join(RAIZ, 'src/tutorial/voz.json'), `${JSON.stringify(voz, null, 1)}\n`);
console.log(relatorio.join('\n'));
console.log(`voz.json gravado: ${Object.keys(voz).length} cenas`);
if (semAudio.length) console.log(`cenas sem áudio (ficam na régua de 2,5 palavras/s): ${semAudio.join(', ')}`);
if (falhas.length) {
  console.error(`nenhuma frase casou com pausa (marcas só estimadas): ${falhas.join(', ')}`);
  process.exitCode = 1;
}
if (sobrando.length) {
  console.error(`áudio sem cena correspondente: ${sobrando.join(', ')}`);
  process.exitCode = 1;
}
