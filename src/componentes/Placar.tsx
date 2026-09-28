import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import {
  MEMBROS,
  type Pauta,
  type Voto,
  contar,
  ehSimNao,
  opcoesDa,
} from "../dados";
import { corDaOpcao } from "./app/Telao";
import { estiloEntrada, janela, mapa, mola, pulso } from "./movimento";

// Placar grande ao lado do celular: acompanha os votos que já chegaram no telão.
export const Placar: React.FC<{
  pauta: Pauta;
  votos: Voto[];
  inicioCascata: number;
  ritmo?: number;
  aparece: number;
  destaque?: { texto: string; em: number };
  x: number;
  y: number;
  largura: number;
}> = ({
  pauta,
  votos,
  inicioCascata,
  ritmo = 1,
  aparece,
  destaque,
  x,
  y,
  largura,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chegada = (v: Voto) => inicioCascata + v.atraso * ritmo;
  const chegados = votos.filter((v) => frame >= chegada(v));
  const placar = contar(pauta, chegados);
  const ultimaDe = (op: Voto["opcao"]) =>
    Math.max(-1, ...chegados.filter((v) => v.opcao === op).map(chegada));
  const todos = chegados.length === MEMBROS.length;
  const quandoTodos = todos ? Math.max(...chegados.map(chegada)) : -1;
  const simNao = ehSimNao(pauta);
  const selo =
    destaque && frame >= destaque.em
      ? mola(frame, fps, destaque.em, "bouncy")
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: simNao ? 10 : 14,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: simNao ? "row" : "column",
          gap: simNao ? 24 : 12,
        }}
      >
        {opcoesDa(pauta).map((op, i) => {
          const ultima = ultimaDe(op);
          const cor = corDaOpcao(op);
          return (
            <div
              key={String(op)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: simNao ? "column" : "row",
                alignItems: "center",
                justifyContent: simNao ? "center" : "space-between",
                gap: simNao ? 0 : 16,
                padding: simNao ? "20px 10px 14px" : "10px 24px",
                borderRadius: 24,
                background: theme.cores.superficie,
                border: `1px solid ${theme.cores.borda}`,
                boxShadow: theme.efeitos.sombraJanela,
                ...estiloEntrada(
                  mola(frame, fps, aparece + i * 5, "smooth"),
                  40,
                  0.92,
                ),
              }}
            >
              <span
                style={{
                  fontSize: simNao ? 44 : 32,
                  fontWeight: 800,
                  color: cor,
                  letterSpacing: simNao ? "0.04em" : 0,
                  whiteSpace: "nowrap",
                }}
              >
                {simNao ? placar[i].rotulo.toUpperCase() : placar[i].rotulo}
              </span>
              <span
                style={{
                  fontSize: simNao ? 150 : 64,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: cor,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                  transform: `scale(${ultima >= 0 ? pulso(frame, ultima, 1.12, 10) : 1})`,
                }}
              >
                {placar[i].votos}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", height: 70, marginTop: 8 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: todos ? theme.cores.texto : theme.cores.textoSuave,
            // o texto antigo sai em 6 quadros, antes de a mola do selo assentar
            opacity:
              (destaque ? 1 - janela(frame, destaque.em, destaque.em + 6) : 1) *
              Math.min(1, mola(frame, fps, aparece + 12, "smooth")),
            transform: `scale(${todos ? pulso(frame, quandoTodos, 1.1, 14) : 1})`,
          }}
        >
          {chegados.length} de {MEMBROS.length} votaram
        </div>
        {destaque && selo > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                padding: "8px 34px",
                borderRadius: 999,
                background: theme.cores.destaque,
                color: theme.cores.destaqueTexto,
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: "0.04em",
                opacity: Math.min(1, selo),
                transform: `scale(${mapa(selo, 0.6, 1)})`,
                boxShadow: `0 0 ${50 * janela(frame, destaque.em, destaque.em + 20)}px ${theme.efeitos.brilhoDestaque}`,
              }}
            >
              {destaque.texto}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
