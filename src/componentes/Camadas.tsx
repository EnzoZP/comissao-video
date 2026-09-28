import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Camada 1: fundo claro do app com duas manchas azuis em deriva lenta. Fica fora das
// cenas para correr contínuo entre os cortes.
export const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 60;
  const d2 = Math.cos(frame / 70) * 50;
  return (
    <AbsoluteFill style={{ background: theme.cores.fundo }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          top: -560,
          left: -520 + d1,
          background: `radial-gradient(circle, ${theme.efeitos.manchaA}, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          bottom: -520,
          right: -460 - d2,
          background: `radial-gradient(circle, ${theme.efeitos.manchaB}, transparent 64%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Granulado procedural e ESTÁTICO: granulado que muda a cada quadro estoura o limite de
// tamanho do arquivo para o WhatsApp.
const RUIDO = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

// Camadas 4 e 5: grade de cor, granulado e vinheta, sempre por cima de tudo.
export const Acabamento: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: theme.cores.destaque,
        mixBlendMode: "soft-light",
        opacity: 0.06,
      }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${theme.efeitos.gradeTopo}, transparent 22%, transparent 78%, ${theme.efeitos.gradeBase})`,
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: RUIDO,
        backgroundSize: "220px",
        opacity: 0.035,
        mixBlendMode: "multiply",
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, transparent 58%, ${theme.efeitos.vinheta} 100%)`,
      }}
    />
  </AbsoluteFill>
);
