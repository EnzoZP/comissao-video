import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CENAS, type CenaId, quadros, SAIDA } from "../roteiro";
import { theme } from "../theme";
import { janela, mapa, mola, respirar } from "./movimento";

export const duracaoDa = (id: CenaId) => {
  const cena = CENAS.find((c) => c.id === id);
  if (!cena) throw new Error(`Cena desconhecida: ${id}`);
  return quadros(cena.segundos);
};

// Envolve o conteúdo de uma cena e faz a saída rápida nos últimos quadros.
export const Cena: React.FC<{
  duracao: number;
  saida?: number;
  children: React.ReactNode;
}> = ({ duracao, saida = SAIDA, children }) => {
  const frame = useCurrentFrame();
  const t = janela(frame, duracao - saida, duracao - 1, theme.ease.in);
  return (
    <AbsoluteFill
      style={{
        fontFamily: theme.fonte,
        color: theme.cores.texto,
        opacity: 1 - t,
        transform: `translateY(${-42 * t}px) scale(${1 - 0.02 * t})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Texto revelado palavra por palavra (opacidade + subida), com uma palavra opcional na cor
// de destaque.
export const Palavras: React.FC<{
  texto: string;
  inicio: number;
  intervalo?: number;
  destaque?: string;
  style?: React.CSSProperties;
  espaco?: number;
}> = ({ texto, inicio, intervalo = 3, destaque, style, espaco = 16 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: espaco,
        ...style,
      }}
    >
      {texto.split(" ").map((palavra, i) => {
        const p = mola(frame, fps, inicio + i * intervalo, "snappy");
        const limpa = palavra.replace(/[.,:!?]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p),
              transform: `translateY(${mapa(p, 34, 0)}px)`,
              color:
                destaque && limpa === destaque
                  ? theme.cores.destaque
                  : undefined,
            }}
          >
            {palavra}
          </span>
        );
      })}
    </div>
  );
};

// Título curto de cena, no topo da faixa segura, com um traço azul que cresce embaixo.
export const TituloCena: React.FC<{
  texto: string;
  inicio?: number;
  topo?: number;
}> = ({ texto, inicio = 2, topo = 250 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palavras = texto.split(" ").length;
  const traco = mola(frame, fps, inicio + palavras * 3 + 2, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 70,
        right: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        transform: `translateY(${respirar(frame, 0, 2, 40)}px)`,
      }}
    >
      <Palavras
        texto={texto}
        inicio={inicio}
        style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
          textAlign: "center",
        }}
        espaco={15}
      />
      <div
        style={{
          width: mapa(Math.min(1, traco), 0, 96),
          height: 8,
          borderRadius: 4,
          background: theme.cores.destaque,
        }}
      />
    </div>
  );
};
