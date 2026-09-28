import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { CLAMP, janela, mapa, noCaminho, type Ponto } from "./movimento";

// Todas as coordenadas daqui são do sistema do contêiner onde o componente é desenhado
// (px CSS do painel ou do celular).

// ---------- Cursor do mouse ----------
export const Cursor: React.FC<{
  pontos: Ponto[];
  cliques: number[];
  aparece: number;
  some?: number;
  tamanho?: number;
}> = ({ pontos, cliques, aparece, some = 1e6, tamanho = 26 }) => {
  const frame = useCurrentFrame();
  const entrada = janela(frame, aparece, aparece + 8);
  const saida = janela(frame, some, some + 8, theme.ease.in);
  const visivel = entrada * (1 - saida);
  if (visivel <= 0) return null;
  const { x, y } = noCaminho(frame, pontos);
  const clique = cliques.find((c) => frame >= c - 4 && frame <= c + 18);
  const aperto =
    clique === undefined
      ? 1
      : interpolate(frame, [clique - 3, clique, clique + 6], [1, 0.8, 1], {
          ...CLAMP,
          easing: theme.ease.out,
        });
  const onda = clique === undefined ? 0 : janela(frame, clique, clique + 16);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        zIndex: 50,
      }}
    >
      {clique !== undefined && frame >= clique && (
        <div
          style={{
            position: "absolute",
            left: -mapa(onda, 8, 34),
            top: -mapa(onda, 8, 34),
            width: mapa(onda, 16, 68),
            height: mapa(onda, 16, 68),
            borderRadius: "50%",
            border: `3px solid ${theme.cores.destaque}`,
            opacity: 1 - onda,
          }}
        />
      )}
      <svg
        width={tamanho}
        height={tamanho * 1.4}
        viewBox="0 0 20 28"
        style={{
          position: "absolute",
          left: -2,
          top: -1,
          opacity: visivel,
          transformOrigin: "2px 1px",
          transform: `scale(${aperto * mapa(entrada, 0.6, 1)})`,
          filter: `drop-shadow(${theme.efeitos.sombraCursor})`,
        }}
      >
        <path
          d="M2 1 L2 22 L7.5 17 L11 25.5 L14.5 24 L11 15.8 L18 15.8 Z"
          fill={theme.efeitos.cursorCorpo}
          stroke={theme.efeitos.cursorContorno}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ---------- Toque de dedo na tela do celular ----------
export const Toque: React.FC<{ x: number; y: number; quadro: number }> = ({
  x,
  y,
  quadro,
}) => {
  const frame = useCurrentFrame();
  if (frame < quadro - 10 || frame > quadro + 22) return null;
  const chega = janela(frame, quadro - 10, quadro - 2);
  const vai = janela(frame, quadro + 6, quadro + 16, theme.ease.in);
  const aperto = interpolate(
    frame,
    [quadro - 2, quadro, quadro + 5],
    [1, 0.82, 1],
    {
      ...CLAMP,
      easing: theme.ease.out,
    },
  );
  const onda = janela(frame, quadro, quadro + 18);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        zIndex: 50,
      }}
    >
      {frame >= quadro && (
        <div
          style={{
            position: "absolute",
            left: -mapa(onda, 22, 64),
            top: -mapa(onda, 22, 64),
            width: mapa(onda, 44, 128),
            height: mapa(onda, 44, 128),
            borderRadius: "50%",
            border: `3px solid ${theme.efeitos.toqueAnel}`,
            opacity: 1 - onda,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: theme.efeitos.toque,
          border: `2px solid ${theme.efeitos.toqueAnel}`,
          opacity: chega * (1 - vai),
          transform: `scale(${mapa(chega, 1.4, 1) * aperto})`,
        }}
      />
    </div>
  );
};

// Dedo arrastando (rolagem de lista).
export const Arraste: React.FC<{ pontos: Ponto[] }> = ({ pontos }) => {
  const frame = useCurrentFrame();
  const inicio = pontos[0].f;
  const fim = pontos[pontos.length - 1].f;
  if (frame < inicio - 8 || frame > fim + 10) return null;
  const chega = janela(frame, inicio - 8, inicio);
  const vai = janela(frame, fim, fim + 10, theme.ease.in);
  const { x, y } = noCaminho(frame, pontos);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: theme.efeitos.toque,
        border: `2px solid ${theme.efeitos.toqueAnel}`,
        opacity: chega * (1 - vai),
        transform: `scale(${mapa(chega, 1.4, 1)})`,
        zIndex: 50,
      }}
    />
  );
};

// ---------- Digitação ----------
export const digitado = (
  frame: number,
  texto: string,
  inicio: number,
  porLetra = 2,
) =>
  texto.slice(
    0,
    Math.max(
      0,
      Math.min(texto.length, Math.floor((frame - inicio) / porLetra)),
    ),
  );

export const Caret: React.FC<{ visivel: boolean }> = ({ visivel }) => {
  const frame = useCurrentFrame();
  const pisca = Math.floor(frame / 16) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: "1.15em",
        marginLeft: 1,
        verticalAlign: "text-bottom",
        background: theme.cores.texto,
        opacity: visivel && pisca ? 1 : 0,
      }}
    />
  );
};

// ---------- QR decorativo ----------
// Padrão falso com os três quadrados de canto: não codifica endereço nenhum.
const N = 25;
const ehLocalizador = (x: number, y: number) =>
  (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

const moduloEscuro = (x: number, y: number) => {
  const cantos: [number, number][] = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ];
  for (const [cx, cy] of cantos) {
    const dx = x - cx;
    const dy = y - cy;
    if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      const borda = dx === 0 || dy === 0 || dx === 6 || dy === 6;
      const miolo = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      return borda || miolo;
    }
  }
  if (ehLocalizador(x, y)) return false;
  if (y === 6) return x % 2 === 0;
  if (x === 6) return y % 2 === 0;
  if (x >= 16 && x <= 20 && y >= 16 && y <= 20) {
    const dx = Math.abs(x - 18);
    const dy = Math.abs(y - 18);
    return Math.max(dx, dy) !== 1;
  }
  return random(`qr-${x}-${y}`) > 0.52;
};

const CAMINHO_QR = (() => {
  let d = "";
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (moduloEscuro(x, y)) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
})();

export const QrFalso: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox={`0 0 ${N} ${N}`}
    shapeRendering="crispEdges"
  >
    <rect width={N} height={N} fill={theme.cores.branco} />
    <path d={CAMINHO_QR} fill={theme.cores.tinta} />
  </svg>
);
