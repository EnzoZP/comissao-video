import type React from "react";
import { theme } from "../../theme";

// Estilos do app redesenhados a partir do public/estilo.css real, em px CSS.
// Alturas fixas onde o cursor precisa acertar o alvo: as posições dos cliques são somas
// destas mesmas constantes (ver painel.tsx).
const c = theme.cores;

export const MEDIDA = {
  botao: 40,
  input: 44,
  textarea: 90,
  rotulo: 22,
  h2: 22,
  h2Margem: 12,
  itemLista: 60,
  itemListaVazio: 44,
  linha: 22.4,
  secaoPad: 16,
  paginaPad: 16,
  paginaTopo: 20,
  gapSecao: 20,
  larguraPainel: 680,
};

const botaoBase: React.CSSProperties = {
  height: MEDIDA.botao,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  padding: "0 14px",
  border: `1px solid ${c.borda}`,
  borderRadius: 8,
  background: c.superficie,
  color: c.texto,
  fontSize: 16,
  whiteSpace: "nowrap",
};

export const estilo = {
  botao: botaoBase,
  botaoPrimario: {
    ...botaoBase,
    background: c.destaque,
    color: c.destaqueTexto,
    borderColor: "transparent",
  } as React.CSSProperties,
  botaoPerigo: { ...botaoBase, color: c.nao } as React.CSSProperties,
  secao: {
    background: c.superficie,
    border: `1px solid ${c.borda}`,
    borderRadius: theme.raio,
    padding: MEDIDA.secaoPad,
    boxSizing: "border-box",
    overflow: "hidden",
  } as React.CSSProperties,
  h2: {
    margin: `0 0 ${MEDIDA.h2Margem}px`,
    height: MEDIDA.h2,
    fontSize: 18.4,
    lineHeight: `${MEDIDA.h2}px`,
    fontWeight: 700,
  } as React.CSSProperties,
  suave: {
    color: c.textoSuave,
    margin: 0,
    fontSize: 16,
    lineHeight: `${MEDIDA.linha}px`,
  } as React.CSSProperties,
  etiqueta: {
    fontSize: 12.8,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 999,
    background: c.neutro,
    color: c.texto,
  } as React.CSSProperties,
  input: {
    height: MEDIDA.input,
    boxSizing: "border-box",
    border: `1px solid ${c.borda}`,
    borderRadius: 8,
    background: c.superficie,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    fontSize: 16,
  } as React.CSSProperties,
  rotulo: {
    height: MEDIDA.rotulo,
    lineHeight: `${MEDIDA.rotulo}px`,
    fontWeight: 600,
    fontSize: 16,
  } as React.CSSProperties,
  // celular
  cartao: {
    background: c.superficie,
    border: `1px solid ${c.borda}`,
    borderRadius: theme.raio,
    padding: 20,
  } as React.CSSProperties,
  cargo: {
    textTransform: "uppercase",
    letterSpacing: ".06em",
    fontSize: 13.6,
    lineHeight: "19px",
    color: c.textoSuave,
    margin: 0,
  } as React.CSSProperties,
  nomes: {
    fontSize: 25.6,
    lineHeight: "31px",
    fontWeight: 800,
    margin: "6px 0 0",
  } as React.CSSProperties,
  opcoes: { display: "grid", gap: 12, marginTop: 20 } as React.CSSProperties,
  opcao: {
    height: 72,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22.4,
    fontWeight: 800,
    border: `3px solid ${c.borda}`,
    borderRadius: theme.raio,
    background: c.superficie,
    color: c.texto,
  } as React.CSSProperties,
  statusVoto: {
    textAlign: "center",
    fontSize: 17.6,
    lineHeight: "24.6px",
    margin: "16px 0 0",
  } as React.CSSProperties,
};
