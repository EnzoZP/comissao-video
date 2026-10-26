// Peças das páginas dos PDFs: telas recortadas das capturas reais, com o anel e o número sobre o
// botão medido (src/tutorial/capturas.json), dentro das molduras de navegador, celular, telão e
// folha. Tudo é HTML em texto: quem imprime é scripts/pdf/gerar-pdf.mjs.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = path.resolve(import.meta.dirname, '..');
const CAPTURAS = JSON.parse(readFileSync(path.join(RAIZ, 'src/tutorial/capturas.json'), 'utf8'));
const MARCA = path.resolve(RAIZ, '../app/public/marca');

export const LARGURA = 1280;
// Anéis e números que caíram fora do recorte: o gerador lista todos e não imprime.
export const FORA_DO_RECORTE = [];
export const ALTURA = 720;

const r1 = (n) => Math.round(n * 10) / 10;
const url = (arquivo) => pathToFileURL(arquivo).href;
export const marca = (cor = 'azul') => url(path.join(MARCA, `logo-${cor}.svg`));

function captura(id) {
  const c = CAPTURAS[id];
  if (!c) throw new Error(`captura inexistente: ${id}`);
  return c;
}
function caixa(id, alvo) {
  const b = captura(id).alvos[alvo];
  if (!b) throw new Error(`alvo inexistente: ${id}#${alvo}`);
  return b;
}

// A captura recortada para uma área de w × h. Parte de "cobrir a área" (object-fit: cover) com o
// zoom pedido, centrada no foco; se os alvos marcados (anéis e números, com a folga do número) não
// cabem, diminui a escala até caberem, no mínimo a captura inteira, e centra no conjunto deles. A
// sobra fica com a cor de fundo da própria tela. Marca que ainda cai fora do recorte é erro
// (FORA_DO_RECORTE), não enfeite cortado.
const FOLGA_DO_PONTO = 60; // px da captura, do lado em que o número fica
export function tela(id, { w, h, foco, zoom = 1, aneis = [], pontos = [], ancora = 'centro' }) {
  const c = captura(id);
  const W = c.largura;
  const H = c.altura;
  const marcadas = [
    ...aneis.map((a) => ({ ...caixa(id, a) })),
    ...pontos.map(({ alvo, lado = 'esquerda' }) => {
      const b = caixa(id, alvo);
      if (lado === 'dentro') return { ...b };
      if (lado === 'baixo') return { x: b.x, y: b.y, w: b.w, h: b.h + FOLGA_DO_PONTO };
      return lado === 'direita'
        ? { x: b.x, y: b.y, w: b.w + FOLGA_DO_PONTO, h: b.h }
        : { x: b.x - FOLGA_DO_PONTO, y: b.y, w: b.w + FOLGA_DO_PONTO, h: b.h };
    }),
  ];
  if (foco) marcadas.push(caixa(id, foco));
  let s = Math.max(w / W, h / H) * zoom;
  let cx = W / 2;
  let cy = ancora === 'topo' ? 0 : H / 2;
  if (foco) {
    const b = caixa(id, foco);
    cx = b.x + b.w / 2;
    cy = b.y + b.h / 2;
  }
  if (marcadas.length) {
    const margem = 24;
    const x0 = Math.min(...marcadas.map((b) => b.x)) - margem;
    const y0 = Math.min(...marcadas.map((b) => b.y)) - margem;
    const x1 = Math.max(...marcadas.map((b) => b.x + b.w)) + margem;
    const y1 = Math.max(...marcadas.map((b) => b.y + b.h)) + margem;
    const cabe = Math.min(w / (x1 - x0), h / (y1 - y0));
    if (cabe < s) {
      s = Math.max(cabe, Math.min(w / W, h / H));
      cx = (x0 + x1) / 2;
      cy = (y0 + y1) / 2;
    }
  }
  // captura menor que a área numa direção: centrada nela; senão, presa às bordas
  const limitar = (v, total, area) => (total <= area ? (area - total) / 2 : Math.min(0, Math.max(area - total, v)));
  const ox = limitar(w / 2 - cx * s, W * s, w);
  const oy = limitar(h / 2 - cy * s, H * s, h);
  const naTela = (b, folga = 0) => ({
    x: r1(ox + b.x * s - folga), y: r1(oy + b.y * s - folga), w: r1(b.w * s + 2 * folga), h: r1(b.h * s + 2 * folga),
  });
  const dentro = (b, nome) => {
    if (b.x < -2 || b.y < -2 || b.x + b.w > w + 2 || b.y + b.h > h + 2) {
      FORA_DO_RECORTE.push(`${id}#${nome} fica fora do recorte ${w}×${h} (zoom ${zoom}, foco ${foco ?? '-'})`);
    }
    return b;
  };
  const camadas = [
    ...aneis.map((a) => {
      const b = dentro(naTela(caixa(id, a), 6), a);
      return `<div class="anel" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"></div>`;
    }),
    ...pontos.map(({ alvo, n, lado = 'esquerda' }) => {
      const b = dentro(naTela(caixa(id, alvo)), alvo);
      // ao lado do alvo, sem cobrir o começo dele (a caixa de marcar fica à esquerda do rótulo)
      // 'dentro': na ponta direita do próprio alvo (botão que ocupa a largura toda da tela)
      // 'baixo': centrado embaixo do alvo, quando ao lado há outro botão ou texto
      const x = { direita: b.x + b.w + 8, dentro: b.x + b.w - 42, baixo: b.x + b.w / 2 - 17 }[lado] ?? b.x - 42;
      const y = lado === 'baixo' ? b.y + b.h + 6 : b.y + b.h / 2 - 17;
      dentro({ x, y, w: 34, h: 34 }, `${alvo} (número)`);
      return `<div class="ponto" style="left:${r1(x)}px;top:${r1(y)}px">${n}</div>`;
    }),
  ];
  return `<div class="quadro" style="background:${c.fundo ?? '#fff'}"><img src="${url(path.join(RAIZ, 'public', c.arquivo))}" alt="" `
    + `style="left:${r1(ox)}px;top:${r1(oy)}px;width:${r1(W * s)}px;height:${r1(H * s)}px"></div>${camadas.join('')}`;
}

const pos = ({ x, y, w, h }) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;

// Navegador: barra de 34 px com o endereço da captura, tela embaixo.
export function navegador(id, { x, y, w, h, ...opcoes }) {
  const caminho = captura(id).caminho ?? '/painel';
  return `<div class="navegador" style="${pos({ x, y, w, h })}">`
    + `<div class="barra-nav"><i></i><i></i><i></i><span class="url">comissao-votacao.vercel.app${caminho}</span></div>`
    + `<div class="tela">${tela(id, { w: w - 2, h: h - 36, ...opcoes })}</div></div>`;
}

// Celular: a tela tem a proporção da captura (390 × 790); a altura sai da largura.
export function celular(id, { x, y, w, ...opcoes }) {
  const c = captura(id);
  const tw = w - 22;
  const th = Math.round((tw * c.altura) / c.largura);
  return `<div class="celular" style="${pos({ x, y, w, h: th + 22 })}"><div class="ilha"></div>`
    + `<div class="tela">${tela(id, { w: tw, h: th, ...opcoes })}</div></div>`;
}

// Telão 16:9, com a borda escura do projetor.
export function telao(id, { x, y, w, ...opcoes }) {
  const tw = w - 20;
  const th = Math.round((tw * 9) / 16);
  return `<div class="telao" style="${pos({ x, y, w, h: th + 20 })}">`
    + `<div class="tela">${tela(id, { w: tw, h: th, ...opcoes })}</div></div>`;
}

// Folha impressa (ata, lista): um recorte de papel, a partir do topo salvo foco.
export function folha(id, { x, y, w, h, ...opcoes }) {
  return `<div class="folha" style="${pos({ x, y, w, h })}"><div class="tela">${tela(id, { w, h, ancora: 'topo', ...opcoes })}</div></div>`;
}

// O número da página é preenchido pelo gerador, pela posição dela no documento.
export function rodape({ esquerda, cor = 'azul' }) {
  return `<footer class="rodape"><span>${esquerda}</span>`
    + `<span style="display:flex;align-items:center;gap:22px"><span class="num"></span>`
    + `<img class="marca" src="${marca(cor)}" alt="Igreja Adventista do Sétimo Dia"></span></footer>`;
}

export const pagina = (classe, conteudo) => `<section class="pagina ${classe}">${conteudo}</section>`;
