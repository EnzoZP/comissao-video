import React from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";
import {
  MEMBROS,
  type Opcao,
  type Pauta,
  type Voto,
  ehSimNao,
  opcoesDa,
  resultadoDa,
  rotuloDa,
} from "../../dados";
import { QrFalso } from "../Interacao";
import { estiloEntrada, janela, mapa, mola, pulso } from "../movimento";

// Telão (sempre escuro), redesenhado do telao.html real. Tamanhos em px de vídeo, para
// uma tela de 1000 px de largura.
const t = theme.cores.telao;

export const corDaOpcao = (opcao: Opcao) =>
  opcao === "sim"
    ? theme.cores.sim
    : opcao === "nao"
      ? theme.cores.nao
      : theme.cores.candidatos[opcao];

const Topo: React.FC<{
  rotulo: string;
  titulo: string;
  tituloTamanho: number;
  selo: React.ReactNode;
  p: number;
}> = ({ rotulo, titulo, tituloTamanho, selo, p }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 20,
      ...estiloEntrada(p, 20, 0.98),
    }}
  >
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          fontSize: 17,
          lineHeight: "22px",
          color: t.textoSuave,
        }}
      >
        {rotulo}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: tituloTamanho,
          lineHeight: 1.12,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {titulo}
      </p>
    </div>
    {selo}
  </div>
);

// Troca "aguardando" → voto sem os dois textos visíveis ao mesmo tempo.
const sai = (p: number) => Math.max(0, 1 - p * 2);
const entra = (p: number) => Math.max(0, p * 2 - 1);

const estiloSelo: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 800,
  padding: "8px 17px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};

// ---------- Tela de entrada (QR) ----------
export const TelaoEntrada: React.FC<{
  aparece?: number;
  entradas?: { membro: number; atraso: number }[];
  inicioCascata?: number;
}> = ({ aparece = -100, entradas = [], inicioCascata = Infinity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chegadaDe = (membro: number) => {
    const e = entradas.find((x) => x.membro === membro);
    return e ? inicioCascata + e.atraso : Infinity;
  };
  const entraram = MEMBROS.filter((_, i) => frame >= chegadaDe(i)).length;
  const ultima = Math.max(
    ...MEMBROS.map((_, i) => (frame >= chegadaDe(i) ? chegadaDe(i) : -1)),
  );
  const passos = [
    "Aponte a câmera do celular para o QR",
    "Toque no seu nome",
    "Pronto: aguarde a votação abrir",
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <Topo
        rotulo="Comissão de Nomeações"
        titulo="Entre pelo celular para votar"
        tituloTamanho={36}
        p={mola(frame, fps, aparece, "smooth")}
        selo={
          <span
            style={{
              ...estiloSelo,
              background: theme.cores.sim,
              color: theme.cores.branco,
              display: "inline-block",
              transform: `scale(${mola(frame, fps, aparece + 6, "bouncy") * (ultima >= 0 ? pulso(frame, ultima, 1.08, 10) : 1)})`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {entraram} de {MEMBROS.length} entraram
          </span>
        }
      />
      <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
        <div
          style={{
            width: 240,
            height: 240,
            background: theme.cores.branco,
            borderRadius: theme.raio,
            padding: 10,
            boxSizing: "border-box",
            ...estiloEntrada(mola(frame, fps, aparece + 8, "smooth"), 24, 0.9),
          }}
        >
          <QrFalso tamanho={220} />
        </div>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: 10,
          }}
        >
          {passos.map((passo, i) => (
            <li
              key={passo}
              style={{
                fontSize: 27,
                fontWeight: 700,
                lineHeight: 1.3,
                display: "flex",
                gap: 12,
                ...estiloEntrada(
                  mola(frame, fps, aparece + 14 + i * 5, "smooth"),
                  18,
                  0.98,
                ),
              }}
            >
              <span
                style={{
                  color: t.textoSuave,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {i + 1}.
              </span>
              {passo}
            </li>
          ))}
        </ol>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
        }}
      >
        {MEMBROS.map((nome, i) => {
          const chegada = chegadaDe(i);
          const pv =
            frame >= chegada
              ? Math.min(1, mola(frame, fps, chegada, "snappy"))
              : 0;
          return (
            <div
              key={nome}
              style={{
                height: 64,
                boxSizing: "border-box",
                borderRadius: theme.raio,
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: interpolateColors(
                  pv,
                  [0, 1],
                  [t.neutro, theme.cores.sim],
                ),
                ...estiloEntrada(
                  mola(frame, fps, aparece + 20 + i * 1.2, "snappy"),
                  12,
                  0.9,
                ),
                scale: String(
                  frame >= chegada ? pulso(frame, chegada, 1.1, 10) : 1,
                ),
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {nome}
              </span>
              <span
                style={{
                  position: "relative",
                  height: 17,
                  marginTop: 2,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    color: t.textoSuave,
                    fontWeight: 500,
                    opacity: sai(pv),
                  }}
                >
                  aguardando
                </span>
                <span
                  style={{
                    position: "absolute",
                    fontWeight: 800,
                    opacity: entra(pv),
                  }}
                >
                  ENTROU
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Tela de votação ----------
export const TelaoVotacao: React.FC<{
  pauta: Pauta;
  votos: Voto[];
  inicioCascata: number;
  ritmo?: number;
  aparece?: number;
  encerrarEm?: number;
}> = ({
  pauta,
  votos,
  inicioCascata,
  ritmo = 1,
  aparece = -100,
  encerrarEm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const simNao = ehSimNao(pauta);
  const chegada = (v: Voto) => inicioCascata + v.atraso * ritmo;
  const chegados = votos.filter((v) => frame >= chegada(v));
  const opcoes = opcoesDa(pauta);
  // contagem contínua para as barras crescerem suaves; número inteiro para o texto
  const continuo = (op: Opcao) =>
    votos
      .filter((v) => v.opcao === op && frame >= chegada(v))
      .reduce(
        (s, v) => s + Math.min(1, mola(frame, fps, chegada(v), "smooth")),
        0,
      );
  const maior = Math.max(1, ...opcoes.map(continuo));
  // sem encerrarEm, a votação fica aberta a cena inteira
  const fecha = encerrarEm ?? 1e6;
  const encerrada = janela(frame, fecha, fecha + 8);
  const seloNovo = frame >= fecha ? mola(frame, fps, fecha, "bouncy") : 0;
  const resultadoAltura = janela(frame, fecha + 4, fecha + 18);
  const resultadoP =
    frame >= fecha + 6 ? mola(frame, fps, fecha + 6, "bouncy") : 0;
  const brilho = Math.min(1, resultadoP) * 0.85;
  const ultimaChegada = Math.max(-1, ...chegados.map(chegada));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Topo
        rotulo={pauta.cargo}
        titulo={simNao ? pauta.candidatos[0] : pauta.candidatos.join(" • ")}
        tituloTamanho={simNao ? 38 : 27}
        p={mola(frame, fps, aparece, "smooth")}
        selo={
          <span
            style={{
              position: "relative",
              display: "inline-block",
              height: 43,
              minWidth: 196,
            }}
          >
            <span
              style={{
                ...estiloSelo,
                position: "absolute",
                right: 0,
                background: theme.cores.sim,
                color: theme.cores.branco,
                opacity: 1 - encerrada,
                transform: `scale(${mola(frame, fps, aparece + 8, "bouncy")})`,
              }}
            >
              VOTAÇÃO ABERTA
            </span>
            <span
              style={{
                ...estiloSelo,
                position: "absolute",
                right: 0,
                background: t.neutro,
                color: t.texto,
                opacity: encerrada,
                transform: `scale(${mapa(Math.min(1.2, seloNovo), 0.7, 1)})`,
              }}
            >
              ENCERRADA
            </span>
          </span>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 12,
          marginTop: 18,
        }}
      >
        {MEMBROS.map((nome, i) => {
          const voto = votos.find((v) => v.membro === i);
          const quando = voto ? chegada(voto) : Infinity;
          const pv =
            frame >= quando
              ? Math.min(1, mola(frame, fps, quando, "snappy"))
              : 0;
          const cor = voto ? corDaOpcao(voto.opcao) : t.neutro;
          const [primeiro, ...resto] = nome.split(" ");
          return (
            <div
              key={nome}
              style={{
                height: simNao ? 100 : 92,
                boxSizing: "border-box",
                borderRadius: theme.raio,
                padding: "8px 11px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: interpolateColors(pv, [0, 1], [t.neutro, cor]),
                ...estiloEntrada(
                  mola(frame, fps, aparece + 10 + i * 1.2, "snappy"),
                  14,
                  0.9,
                ),
                scale: String(
                  frame >= quando ? pulso(frame, quando, 1.09, 12) : 1,
                ),
              }}
            >
              <span
                style={{ fontSize: 17, lineHeight: "20px", fontWeight: 700 }}
              >
                {primeiro}
                <br />
                {resto.join(" ")}
              </span>
              <span
                style={{
                  position: "relative",
                  height: 19,
                  marginTop: 4,
                  fontSize: 15,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    color: t.textoSuave,
                    fontWeight: 500,
                    opacity: sai(pv),
                  }}
                >
                  aguardando
                </span>
                <span
                  style={{
                    position: "absolute",
                    fontWeight: 800,
                    opacity: entra(pv),
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* nome do candidato: só o primeiro nome cabe no cartão */}
                  {voto
                    ? rotuloDa(pauta, voto.opcao).split(" ")[0].toUpperCase()
                    : ""}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          height: 74 * resultadoAltura,
          marginBottom: 12 * resultadoAltura,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {resultadoAltura > 0 && (
          <div
            style={{
              width: "100%",
              height: 74,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "0.02em",
              borderRadius: theme.raio,
              background: t.superficie,
              border: `3px solid ${t.borda}`,
              opacity: Math.min(1, resultadoP),
              transform: `scale(${mapa(resultadoP, 0.8, 1)})`,
              boxShadow: `0 0 ${48 * brilho}px ${theme.efeitos.brilhoTelao}`,
            }}
          >
            {resultadoDa(pauta, chegados)}
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 30,
          alignItems: "end",
          ...estiloEntrada(mola(frame, fps, aparece + 30, "smooth"), 14, 1),
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          {opcoes.map((op) => {
            const n = chegados.filter((v) => v.opcao === op).length;
            return (
              <div
                key={String(op)}
                style={{
                  display: "grid",
                  gridTemplateColumns: `${simNao ? 60 : 158}px 1fr 40px`,
                  alignItems: "center",
                  gap: 12,
                  fontSize: 19,
                  fontWeight: 700,
                  height: 26,
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  {rotuloDa(pauta, op)}
                </span>
                <div
                  style={{
                    background: t.neutro,
                    borderRadius: 999,
                    height: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(continuo(op) / maior) * 100}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: corDaOpcao(op),
                    }}
                  />
                </div>
                <span
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {n}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 21,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            display: "inline-block",
            transform: `scale(${ultimaChegada >= 0 ? pulso(frame, ultimaChegada, 1.06, 10) : 1})`,
            transformOrigin: "right bottom",
          }}
        >
          {chegados.length} de {MEMBROS.length} votaram
        </div>
      </div>
    </div>
  );
};
