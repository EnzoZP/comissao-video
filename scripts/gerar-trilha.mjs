// Gera public/trilha.wav: fundo musical ambiente e calmo para a versão com música.
// Síntese pura em Node, sem dependência e sem arquivo baixado (nenhuma questão de
// direitos). Determinístico: a mesma execução gera sempre o mesmo arquivo.
//
// Uso: node scripts/gerar-trilha.mjs  (gera antes de renderizar a composição ComissaoMusica)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

// Duração e início de cada cena vêm do roteiro.ts, a mesma fonte do vídeo: mudou uma
// cena, a trilha acompanha ao ser gerada de novo.
const roteiro = readFileSync(join(RAIZ, "src", "roteiro.ts"), "utf8");
const cenas = [
  ...roteiro.matchAll(/id:\s*"([^"]+)",[^}]*?segundos:\s*([\d.]+)/g),
].map((m) => ({ id: m[1], segundos: Number(m[2]) }));
const inicioDe = {};
let acumulado = 0;
for (const c of cenas) {
  inicioDe[c.id] = acumulado;
  acumulado += c.segundos;
}
const USADAS = ["C03-QR", "C07-Cascata", "C09-Empate", "C10-Ata"];
if (cenas.length === 0 || USADAS.some((id) => inicioDe[id] === undefined)) {
  console.error(
    `roteiro.ts não foi lido: ${cenas.length} cenas encontradas; faltam ${USADAS.filter((id) => inicioDe[id] === undefined).join(", ")}`,
  );
  process.exit(1);
}

const TAXA = 44100;
const DURACAO = acumulado;
const N = Math.round(TAXA * DURACAO);

// 72 BPM, dois compassos por acorde: Dó – Sol – Lá menor – Fá, em volta.
// Com 6,67 s por acorde, o último (80–86,7 s) cai de novo em Dó: o vídeo fecha na tônica.
const BATIDA = 60 / 72;
const ACORDE = BATIDA * 8;
const ACORDES = [
  { baixo: 36, pad: [60, 64, 67], arpejo: [60, 64, 67, 72] }, // Dó
  { baixo: 43, pad: [59, 62, 67], arpejo: [55, 59, 62, 67] }, // Sol
  { baixo: 45, pad: [57, 60, 64], arpejo: [57, 60, 64, 69] }, // Lá menor
  { baixo: 41, pad: [57, 60, 65], arpejo: [53, 57, 60, 65] }, // Fá
];

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);
const suave = (t) =>
  0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

// Intensidade do arpejo ao longo do vídeo, acompanhando o roteiro: entra discreto
// com o QR, cresce na cascata de votos e sai antes da ata e do fechamento.
const ENTRA = inicioDe["C03-QR"];
const CRESCE = inicioDe["C07-Cascata"];
const VOLTA = inicioDe["C09-Empate"];
const SAI = inicioDe["C10-Ata"];
const arpejoEm = (t) => {
  if (t < ENTRA) return 0;
  if (t < CRESCE) return 0.45 * suave((t - ENTRA) / 4);
  if (t < VOLTA) return 0.45 + 0.55 * suave((t - CRESCE) / 3);
  if (t < SAI) return 1 - 0.55 * suave((t - VOLTA) / 3);
  return 0.45 * (1 - suave((t - SAI) / 5));
};

const esq = new Float32Array(N);
const dir = new Float32Array(N);

// Soma uma senoide com envelope em [ini, fim), com duas vozes levemente desafinadas
// (uma em cada canal) para dar largura.
const somaNota = (midi, ini, fim, amp, ataque, soltura, harmonico = 0.15) => {
  const f = freq(midi);
  const fe = f * 2 ** (-4 / 1200);
  const fd = f * 2 ** (4 / 1200);
  const i0 = Math.max(0, Math.floor(ini * TAXA));
  const i1 = Math.min(N, Math.ceil(fim * TAXA));
  for (let i = i0; i < i1; i++) {
    const t = i / TAXA;
    const env =
      suave((t - ini) / ataque) * (1 - suave((t - (fim - soltura)) / soltura));
    const a = amp * env;
    esq[i] +=
      a *
      (Math.sin(2 * Math.PI * fe * t) +
        harmonico * Math.sin(4 * Math.PI * fe * t));
    dir[i] +=
      a *
      (Math.sin(2 * Math.PI * fd * t) +
        harmonico * Math.sin(4 * Math.PI * fd * t));
  }
};

// Nota de sino curta (arpejo): ataque rápido e decaimento exponencial.
const somaSino = (midi, ini, amp, pan) => {
  const f = freq(midi);
  const i0 = Math.floor(ini * TAXA);
  const i1 = Math.min(N, i0 + Math.floor(1.6 * TAXA));
  for (let i = i0; i < i1; i++) {
    const t = (i - i0) / TAXA;
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 3.2);
    const s =
      Math.sin(2 * Math.PI * f * t) +
      0.25 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t * 6);
    esq[i] += amp * env * s * (1 - pan);
    dir[i] += amp * env * s * pan;
  }
};

const totalAcordes = Math.ceil(DURACAO / ACORDE);
for (let k = 0; k < totalAcordes; k++) {
  const c = ACORDES[k % ACORDES.length];
  const ini = k * ACORDE;
  const fim = Math.min(DURACAO, ini + ACORDE + 1.8); // sobreposição = troca suave
  const inicioPad = Math.max(0, ini - 0.6);
  for (const nota of c.pad) somaNota(nota, inicioPad, fim, 0.055, 1.6, 2.2);
  somaNota(c.baixo, inicioPad, fim, 0.045, 1.2, 2.2, 0.05);
  // arpejo em colcheias: sobe e desce nas notas do acorde
  const padrao = [0, 1, 2, 3, 2, 1, 2, 3];
  for (let b = 0; b < 16; b++) {
    const t = ini + b * (BATIDA / 2);
    if (t >= DURACAO - 2) break;
    const nivel = arpejoEm(t);
    if (nivel <= 0.01) continue;
    const nota = c.arpejo[padrao[b % padrao.length]] + 12;
    somaSino(nota, t, 0.09 * nivel, b % 2 === 0 ? 0.35 : 0.65);
  }
}

// Reverb simples (filtros pente + passa-tudo, no estilo Freeverb) para dar espaço.
const reverb = (entrada, deslocamento) => {
  const pentes = [1557, 1617, 1491, 1422].map((d) => d + deslocamento);
  const passaTudo = [556, 441].map((d) => d + deslocamento);
  const saida = new Float32Array(N);
  for (const d of pentes) {
    const buf = new Float32Array(d);
    let p = 0;
    let filtro = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[p];
      filtro = y * 0.75 + filtro * 0.25; // amortecimento dos agudos
      buf[p] = entrada[i] + filtro * 0.72;
      saida[i] += y / pentes.length;
      p = (p + 1) % d;
    }
  }
  for (const d of passaTudo) {
    const buf = new Float32Array(d);
    let p = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[p];
      const x = saida[i];
      saida[i] = -x + b;
      buf[p] = x + b * 0.5;
      p = (p + 1) % d;
    }
  }
  return saida;
};

const reverbE = reverb(esq, 0);
const reverbD = reverb(dir, 23);
for (let i = 0; i < N; i++) {
  esq[i] = esq[i] * 0.8 + reverbE[i] * 0.35;
  dir[i] = dir[i] * 0.8 + reverbD[i] * 0.35;
}

// Fade de entrada e de saída, e normalização do pico em -1 dBFS.
let pico = 0;
for (let i = 0; i < N; i++) {
  const t = i / TAXA;
  const f = suave(t / 2.5) * (1 - suave((t - (DURACAO - 4)) / 4));
  esq[i] *= f;
  dir[i] *= f;
  pico = Math.max(pico, Math.abs(esq[i]), Math.abs(dir[i]));
}
const ganho = 0.891 / pico;

// WAV PCM 16 bits, estéreo.
const dados = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  dados.writeInt16LE(Math.round(esq[i] * ganho * 32767), i * 4);
  dados.writeInt16LE(Math.round(dir[i] * ganho * 32767), i * 4 + 2);
}
const cab = Buffer.alloc(44);
cab.write("RIFF", 0);
cab.writeUInt32LE(36 + dados.length, 4);
cab.write("WAVE", 8);
cab.write("fmt ", 12);
cab.writeUInt32LE(16, 16);
cab.writeUInt16LE(1, 20); // PCM
cab.writeUInt16LE(2, 22); // estéreo
cab.writeUInt32LE(TAXA, 24);
cab.writeUInt32LE(TAXA * 4, 28);
cab.writeUInt16LE(4, 32);
cab.writeUInt16LE(16, 34);
cab.write("data", 36);
cab.writeUInt32LE(dados.length, 40);

const destino = join(RAIZ, "public", "trilha.wav");
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, Buffer.concat([cab, dados]));
console.log(
  `trilha gerada: ${destino} (${cenas.length} cenas, ${DURACAO} s; pico bruto ${pico.toFixed(3)} normalizado para -1 dBFS)`,
);
