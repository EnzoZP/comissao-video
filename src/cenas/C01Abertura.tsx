import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Cena, Palavras, duracaoDa } from "../componentes/Cena";
import {
  IconeCelular,
  IconeComputador,
  IconeTelao,
} from "../componentes/Icones";
import { estiloEntrada, mapa, mola, respirar } from "../componentes/movimento";

const DURACAO = duracaoDa("C01-Abertura");

const TELAS = [
  { rotulo: "Painel", Icone: IconeComputador },
  { rotulo: "Telão", Icone: IconeTelao },
  { rotulo: "Celular", Icone: IconeCelular },
];

export const C01Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const traco = mola(frame, fps, 36, "smooth");
  return (
    <Cena duracao={DURACAO}>
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${respirar(frame, 0, 3)}px)`,
        }}
      >
        <Palavras
          texto="Comissão de"
          inicio={4}
          intervalo={4}
          style={{
            fontSize: 118,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
          }}
          espaco={28}
        />
        <Palavras
          texto="Nomeações"
          inicio={12}
          style={{
            fontSize: 118,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
          }}
        />
        <div
          style={{
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Palavras
            texto="Votação pelo celular"
            inicio={24}
            destaque="celular"
            style={{
              fontSize: 58,
              fontWeight: 600,
              color: theme.cores.textoSuave,
              letterSpacing: "-0.015em",
            }}
            espaco={16}
          />
          <div
            style={{
              alignSelf: "flex-end",
              width: mapa(Math.min(1, traco), 0, 182),
              height: 7,
              borderRadius: 4,
              background: theme.cores.destaque,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 44,
        }}
      >
        {TELAS.map(({ rotulo, Icone }, i) => {
          const p = mola(frame, fps, 44 + i * 6, "smooth");
          return (
            <div
              key={rotulo}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                ...estiloEntrada(p, 50, 0.9),
              }}
            >
              <div
                style={{
                  width: 210,
                  height: 210,
                  borderRadius: 32,
                  background: theme.cores.superficie,
                  border: `1px solid ${theme.cores.borda}`,
                  boxShadow: theme.efeitos.sombraJanela,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translateY(${respirar(frame, i * 20, 4)}px)`,
                }}
              >
                <Icone tamanho={130} />
              </div>
              <span style={{ fontSize: 36, fontWeight: 700 }}>{rotulo}</span>
            </div>
          );
        })}
      </div>
    </Cena>
  );
};
