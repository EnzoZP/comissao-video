import type React from "react";
import { interpolate, spring } from "remotion";
import { theme } from "../theme";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

type Mola = keyof typeof theme.spring;
type Curva = (t: number) => number;

// Progresso 0→1 de uma mola que começa no quadro `inicio` (pode passar de 1 no ricochete).
export const mola = (
  frame: number,
  fps: number,
  inicio: number,
  tipo: Mola = "smooth",
) => spring({ frame: frame - inicio, fps, config: theme.spring[tipo] });

// Progresso 0→1 numa janela de quadros, sempre com curva e sempre preso nas pontas.
export const janela = (
  frame: number,
  inicio: number,
  fim: number,
  curva: Curva = theme.ease.out,
) => interpolate(frame, [inicio, fim], [0, 1], { ...CLAMP, easing: curva });

// Mapeia um progresso (de mola ou de janela) para um intervalo, preservando o ricochete.
export const mapa = (p: number, de: number, ate: number) => de + (ate - de) * p;

// Entrada padrão: opacidade + subida + escala, juntas.
export const estiloEntrada = (
  p: number,
  distancia = 40,
  escala = 0.94,
): React.CSSProperties => ({
  opacity: Math.min(1, Math.max(0, p)),
  transform: `translateY(${mapa(p, distancia, 0)}px) scale(${mapa(p, escala, 1)})`,
});

// Micro-movimento de quem fica parado na tela por mais de 2 s.
export const respirar = (
  frame: number,
  fase = 0,
  amplitude = 3,
  periodo = 34,
) => Math.sin((frame + fase) / periodo) * amplitude;

export type Ponto = { f: number; x: number; y: number };

// Posição num caminho de pontos-chave; entre dois pontos, a curva é easeInOut.
export const noCaminho = (frame: number, pontos: Ponto[]) => {
  if (frame <= pontos[0].f) return { x: pontos[0].x, y: pontos[0].y };
  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];
    if (frame <= b.f) {
      // dois pontos no mesmo quadro = salto (interpolate exige faixa crescente)
      if (b.f <= a.f) return { x: b.x, y: b.y };
      const t = janela(frame, a.f, b.f, theme.ease.inOut);
      return { x: mapa(t, a.x, b.x), y: mapa(t, a.y, b.y) };
    }
  }
  const ultimo = pontos[pontos.length - 1];
  return { x: ultimo.x, y: ultimo.y };
};

// Pulso curto de escala (1 → pico → 1) a partir de um quadro, para um número que muda ou um
// cartão que recebe voto.
export const pulso = (
  frame: number,
  inicio: number,
  pico = 1.08,
  duracao = 12,
) =>
  interpolate(frame - inicio, [0, duracao * 0.35, duracao], [1, pico, 1], {
    ...CLAMP,
    easing: theme.ease.out,
  });
