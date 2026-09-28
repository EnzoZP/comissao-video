import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { CENAS, type CenaId, quadros } from "./roteiro";
import { Acabamento, Fundo } from "./componentes/Camadas";
import { C01Abertura } from "./cenas/C01Abertura";
import { C02Painel } from "./cenas/C02Painel";
import { C03QR } from "./cenas/C03QR";
import { C04Nome } from "./cenas/C04Nome";
import { C05Abrir } from "./cenas/C05Abrir";
import { C06Voto } from "./cenas/C06Voto";
import { C07Cascata } from "./cenas/C07Cascata";
import { C08Resultado } from "./cenas/C08Resultado";
import { C09Empate } from "./cenas/C09Empate";
import { C10Ata } from "./cenas/C10Ata";
import { C11Fechamento } from "./cenas/C11Fechamento";

export const COMPONENTES: Record<CenaId, React.FC> = {
  "C01-Abertura": C01Abertura,
  "C02-Painel": C02Painel,
  "C03-QR": C03QR,
  "C04-Nome": C04Nome,
  "C05-Abrir": C05Abrir,
  "C06-Voto": C06Voto,
  "C07-Cascata": C07Cascata,
  "C08-Resultado": C08Resultado,
  "C09-Empate": C09Empate,
  "C10-Ata": C10Ata,
  "C11-Fechamento": C11Fechamento,
};

// Fundo e acabamento ficam fora das cenas para correrem contínuos entre os cortes.
export const ComCamadas: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill>
    <Fundo />
    {children}
    <Acabamento />
  </AbsoluteFill>
);

export const Video: React.FC = () => (
  <ComCamadas>
    <Series>
      {CENAS.map((cena) => {
        const Componente = COMPONENTES[cena.id];
        return (
          <Series.Sequence
            key={cena.id}
            name={cena.titulo}
            durationInFrames={quadros(cena.segundos)}
          >
            <Componente />
          </Series.Sequence>
        );
      })}
    </Series>
  </ComCamadas>
);
