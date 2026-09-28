import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Cena, Palavras, duracaoDa } from "../componentes/Cena";
import { mapa, mola, respirar } from "../componentes/movimento";

const DURACAO = duracaoDa("C11-Fechamento");
const SAIDA_LONGA = 18;

// O fechamento sai mais devagar que as outras cenas: é o fim do vídeo.
export const C11Fechamento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const traco = mola(frame, fps, 44, "smooth");
  const assinatura = mola(frame, fps, 52, "smooth");
  const estiloFrase: React.CSSProperties = {
    fontSize: 108,
    fontWeight: 800,
    letterSpacing: "-0.035em",
    lineHeight: 1.06,
  };
  return (
    <Cena duracao={DURACAO} saida={SAIDA_LONGA}>
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          transform: `translateY(${respirar(frame, 0, 3)}px)`,
        }}
      >
        <Palavras
          texto="Simples para"
          inicio={4}
          intervalo={4}
          style={estiloFrase}
          espaco={26}
        />
        <Palavras
          texto="quem vota."
          inicio={12}
          intervalo={4}
          style={estiloFrase}
          espaco={26}
        />
        <div style={{ height: 34 }} />
        <Palavras
          texto="Claro para"
          inicio={24}
          intervalo={4}
          style={estiloFrase}
          espaco={26}
        />
        <Palavras
          texto="quem conduz."
          inicio={32}
          intervalo={4}
          style={estiloFrase}
          espaco={26}
        />
        <div
          style={{
            marginTop: 40,
            width: mapa(Math.min(1, traco), 0, 120),
            height: 8,
            borderRadius: 4,
            background: theme.cores.destaque,
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 40,
            fontWeight: 600,
            color: theme.cores.textoSuave,
            opacity: Math.min(1, assinatura),
            transform: `translateY(${mapa(assinatura, 24, 0)}px)`,
          }}
        >
          Comissão de Nomeações
        </div>
      </div>
    </Cena>
  );
};
