import React from "react";
import { interpolateColors } from "remotion";
import { theme } from "../theme";
import { IconeCadeado, IconesStatus } from "./Icones";

// ---------- Celular ----------
// A tela é desenhada em px CSS de um celular (390 × 844) e o aparelho inteiro é escalado.
export const TELA = { largura: 390, altura: 844, status: 54, aro: 12 };
export const larguraCelular = (escala: number) =>
  (TELA.largura + TELA.aro * 2) * escala;
export const alturaCelular = (escala: number) =>
  (TELA.altura + TELA.aro * 2) * escala;

export const Celular: React.FC<{
  escala: number;
  x: number;
  y: number;
  escuro?: number; // 0 = app (claro), 1 = câmera (escuro); valores no meio fazem a transição
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ escala, x, y, escuro = 0, style, children }) => {
  const corStatus = interpolateColors(
    escuro,
    [0, 1],
    [theme.cores.texto, theme.cores.branco],
  );
  const corTela = interpolateColors(
    escuro,
    [0, 1],
    [theme.cores.fundo, theme.cores.camera],
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: TELA.largura + TELA.aro * 2,
        height: TELA.altura + TELA.aro * 2,
        transformOrigin: "top left",
        transform: `scale(${escala})`,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 62,
          background: theme.cores.aparelho,
          padding: TELA.aro,
          boxShadow: `${theme.efeitos.sombraAparelho}, inset 0 0 0 2px ${theme.cores.aparelhoAro}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            width: TELA.largura,
            height: TELA.altura,
            borderRadius: 50,
            overflow: "hidden",
            background: corTela,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: TELA.status,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {children}
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: TELA.status,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 30px 0 40px",
              fontSize: 16,
              fontWeight: 600,
              color: corStatus,
              // fundo sólido: o conteúdo rolado passa por baixo do relógio sem se misturar
              background: corTela,
            }}
          >
            <span>19:30</span>
            <IconesStatus cor={corStatus} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 11,
              left: (TELA.largura - 120) / 2,
              width: 120,
              height: 35,
              borderRadius: 18,
              background: theme.cores.ilha,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ---------- Janela do navegador (computador da secretaria) ----------
export const BARRA_NAVEGADOR = 56;

export const Navegador: React.FC<{
  x: number;
  y: number;
  largura: number;
  altura: number;
  escala: number; // px de vídeo por px CSS do painel
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, largura, altura, escala, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: largura,
      height: altura,
      borderRadius: 20,
      overflow: "hidden",
      background: theme.cores.superficie,
      border: `1px solid ${theme.cores.borda}`,
      boxShadow: theme.efeitos.sombraJanela,
      ...style,
    }}
  >
    <div
      style={{
        height: BARRA_NAVEGADOR,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        borderBottom: `1px solid ${theme.cores.borda}`,
        boxSizing: "border-box",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: theme.cores.borda,
          }}
        />
      ))}
      <div
        style={{
          marginLeft: 26,
          flex: 1,
          maxWidth: 560,
          height: 34,
          borderRadius: 17,
          background: theme.cores.fundo,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          fontSize: 19,
          color: theme.cores.textoSuave,
        }}
      >
        <IconeCadeado cor={theme.cores.textoSuave} />
        Painel da secretaria
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: BARRA_NAVEGADOR,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        background: theme.cores.fundo,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: largura / escala,
          transformOrigin: "top left",
          transform: `scale(${escala})`,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

// ---------- Telão ----------
export const Telao: React.FC<{
  x: number;
  y: number;
  largura: number;
  altura: number;
  brilho?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, largura, altura, brilho = 0, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: largura,
      height: altura,
      borderRadius: 20,
      overflow: "hidden",
      background: theme.cores.telao.fundo,
      border: `2px solid ${theme.cores.telao.borda}`,
      boxShadow: `${theme.efeitos.sombraTelao}, 0 0 ${90 * brilho}px ${theme.efeitos.brilhoTelao}`,
      color: theme.cores.telao.texto,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `linear-gradient(160deg, ${theme.efeitos.reflexoTela}, transparent 40%)`,
      }}
    />
  </div>
);
