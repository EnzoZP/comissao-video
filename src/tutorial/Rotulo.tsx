import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { janela, mapa, mola } from "../componentes/movimento";
import type { Caixa } from "./tempo";

// Faixa de baixo com duas a quatro palavras sobre o que está na tela. Entra quando o plano
// começa e sai, mais rápido, antes de a próxima entrar (nunca duas ao mesmo tempo).
export const Rotulo: React.FC<{
  texto: string;
  entra: number; // quadro em que começa a entrar
  sai?: number; // quadro em que começa a sair
}> = ({ texto, entra: inicio, sai = 1e6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, inicio, "snappy");
  const saida = janela(frame, sai, sai + 8, theme.ease.in);
  const p = Math.min(1, entra) * (1 - saida);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 26,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 30px",
          borderRadius: 999,
          background: theme.cores.texto,
          color: theme.cores.branco,
          fontFamily: theme.fonte,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          boxShadow: theme.efeitos.sombraDialogo,
          opacity: p,
          transform: `translateY(${mapa(entra, 30, 0) + 24 * saida}px) scale(${mapa(entra, 0.94, 1)})`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: theme.cores.branco,
            opacity: 0.7,
          }}
        />
        {texto}
      </div>
    </div>
  );
};

// Medidas do anel, em px de vídeo. O preflight do Tailwind põe box-sizing: border-box, então a
// borda fica dentro da folga: o vão entre o alvo e o anel é FOLGA − BORDA (8 px).
const FOLGA_DO_ANEL = 12;
const BORDA_DO_ANEL = 4;
// Até onde o anel passa da caixa do alvo (a folga, que já contém a borda, e um respiro).
export const ALCANCE_DO_ANEL = FOLGA_DO_ANEL + 2;

// Anel em volta do alvo, no sistema de coordenadas da captura. `escala` é quantos px de
// vídeo vale um px da captura agora (moldura × câmera), para a borda ter sempre a mesma
// espessura na tela.
export const Destaque: React.FC<{
  caixa: Caixa;
  completo: number;
  sai?: number;
  escala: number;
  // escala de entrada; 1 quando o anel foi recolhido para caber na tela (crescendo, ele passaria
  // da borda e sobrariam só duas linhas)
  cresce?: number;
}> = ({ caixa, completo, sai = 1e6, escala, cresce = 1.04 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = mola(frame, fps, completo - 12, "bouncy");
  const saida = janela(frame, sai, sai + 8, theme.ease.in);
  const p = Math.min(1, entra) * (1 - saida);
  if (p <= 0) return null;
  const folga = FOLGA_DO_ANEL / escala;
  const borda = BORDA_DO_ANEL / escala;
  const brilho = 18 / escala;
  return (
    <div
      style={{
        position: "absolute",
        left: caixa.x - folga,
        top: caixa.y - folga,
        width: caixa.w + folga * 2,
        height: caixa.h + folga * 2,
        borderRadius: 12 / escala,
        border: `${borda}px solid ${theme.cores.anel}`,
        boxShadow: `0 0 ${brilho}px ${theme.efeitos.brilhoAnel}`,
        opacity: p,
        // entra quase do tamanho final: crescendo mais, passava por cima do texto vizinho
        transform: `scale(${mapa(entra, cresce, 1)})`,
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
};
